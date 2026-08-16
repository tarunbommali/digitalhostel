const Payment = require('../models/Payment');
const PaymentAllocation = require('../models/PaymentAllocation');
const MonthlyBill = require('../models/MonthlyBill');
const Student = require('../models/Student');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/responseHelper');
const { withTransaction } = require('../utils/transactionHelper');
const AuditService = require('./auditService');

class PaymentService {
  static async listPayments(organizationId, query = {}, actorUser) {
    const filter = { organizationId };

    if (actorUser.role === 'student') {
      const student = await Student.findOne({ user: actorUser._id, organizationId });
      if (!student) {
        throw new ForbiddenError('Student profile not found');
      }
      filter.student = student._id;
    } else if (query.studentId) {
      filter.student = query.studentId;
    }

    if (query.paymentMethod) {
      filter.paymentMethod = query.paymentMethod.toLowerCase();
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber room')
        .populate('recordedBy', 'fullName')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return { payments, pagination: { total, page, limit } };
  }

  static async getPaymentById(organizationId, paymentId, actorUser) {
    const payment = await Payment.findOne({ _id: paymentId, organizationId })
      .populate('student', 'fullName hostelUid registrationNumber user')
      .populate('recordedBy', 'fullName');

    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (actorUser.role === 'student' && payment.student.user.toString() !== actorUser._id.toString()) {
      throw new ForbiddenError('Access denied: You can only view your own payments.');
    }

    const allocations = await PaymentAllocation.find({ organizationId, payment: payment._id })
      .populate('bill', 'billingPeriod amount remainingAmount status')
      .lean();

    return {
      ...payment.toJSON(),
      allocations,
    };
  }

  static async recordPayment(organizationId, payload, actorUserId) {
    const { studentId, amount, paymentMethod, referenceId, remarks } = payload;
    if (!studentId || !amount || !referenceId) {
      throw new BadRequestError('Student ID, amount, and reference ID are required');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError('Payment amount must be a positive number');
    }

    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const cleanMethod = (paymentMethod || 'sbi_collect').toLowerCase().trim();
    const validMethods = ['sbi_collect', 'cash', 'upi', 'bank_transfer'];
    if (!validMethods.includes(cleanMethod)) {
      throw new BadRequestError(`Invalid payment method. Allowed: [${validMethods.join(', ')}]`);
    }

    const cleanRef = referenceId.trim();

    const payment = await Payment.create({
      organizationId,
      student: student._id,
      amount: numAmount,
      paymentMethod: cleanMethod,
      referenceId: cleanRef,
      transactionId: cleanRef,
      paymentDate: new Date(),
      remarks: remarks ? remarks.trim() : '',
      recordedBy: actorUserId,
    });

    // Automatically settle payment against oldest unpaid bills under transaction
    const settlement = await this.verifyAndSettlePayment(organizationId, payment._id, actorUserId);

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'PAYMENT_RECORDED',
      'Payment',
      payment._id,
      { student: student.fullName, amount: numAmount, referenceId: cleanRef }
    );

    return {
      payment,
      settlement,
    };
  }

  /**
   * Chronological multi-bill payment reconciliation with withTransaction
   */
  static async verifyAndSettlePayment(organizationId, paymentId, actorUserId) {
    return withTransaction(async (session) => {
      const sessionOpts = session ? { session } : {};

      const payment = await Payment.findOne({ _id: paymentId, organizationId }, null, sessionOpts);
      if (!payment) {
        throw new NotFoundError('Payment record not found');
      }

      // Check if already allocated
      const existingAllocations = await PaymentAllocation.find({ organizationId, payment: payment._id }, null, sessionOpts);
      if (existingAllocations.length > 0) {
        return { message: 'Payment is already settled', allocations: existingAllocations };
      }

      // Find student's unpaid bills sorted chronologically (oldest first)
      const unpaidBills = await MonthlyBill.find({
        organizationId,
        student: payment.student,
        status: { $in: ['unpaid', 'partially_paid'] },
      }, null, sessionOpts).sort({ billYear: 1, billMonth: 1 });

      let remainingToAllocate = payment.amount;
      const createdAllocations = [];

      for (const bill of unpaidBills) {
        if (remainingToAllocate <= 0) break;

        const unbilledOnThis = bill.remainingAmount;
        const allocateOnBill = Math.min(remainingToAllocate, unbilledOnThis);

        bill.paidAmount = (bill.paidAmount || 0) + allocateOnBill;
        bill.remainingAmount = Math.max(0, bill.amount - bill.paidAmount);
        bill.status = bill.remainingAmount === 0 ? 'paid' : 'partially_paid';
        await bill.save(sessionOpts);

        const allocDocs = await PaymentAllocation.create(
          [
            {
              organizationId,
              payment: payment._id,
              bill: bill._id,
              allocatedAmount: allocateOnBill,
            },
          ],
          sessionOpts
        );

        createdAllocations.push(allocDocs[0]);
        remainingToAllocate -= allocateOnBill;
      }

      AuditService.recordAuditSafe(
        organizationId,
        actorUserId,
        'PAYMENT_SETTLED',
        'Payment',
        payment._id,
        { settledAmount: payment.amount - remainingToAllocate, allocationsCount: createdAllocations.length }
      );

      return {
        paymentId: payment._id,
        totalPayment: payment.amount,
        allocatedAmount: payment.amount - remainingToAllocate,
        unallocatedAmount: remainingToAllocate,
        allocations: createdAllocations,
      };
    });
  }

  static async getSummary(organizationId) {
    const [totalBilledAgg, totalPaidAgg] = await Promise.all([
      MonthlyBill.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: '$amount' }, remaining: { $sum: '$remainingAmount' } } },
      ]),
      Payment.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalBilled = totalBilledAgg[0]?.total || 0;
    const totalRemaining = totalBilledAgg[0]?.remaining || 0;
    const totalPaid = totalPaidAgg[0]?.total || 0;

    return {
      totalBilled,
      totalPaid,
      totalRemaining,
      collectionRate: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
    };
  }
}

module.exports = PaymentService;
