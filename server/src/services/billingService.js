const MonthlyBill = require('../models/MonthlyBill');
const Student = require('../models/Student');
const LeaveRequest = require('../models/LeaveRequest');
const Payment = require('../models/Payment');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class BillingService {
  static async listBills(organizationId, query = {}, actorUser) {
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

    if (query.billMonth) {
      filter.billMonth = Number(query.billMonth);
    }
    if (query.billYear) {
      filter.billYear = Number(query.billYear);
    }
    if (query.billingPeriod) {
      filter.billingPeriod = query.billingPeriod;
    }
    if (query.status) {
      filter.status = query.status.toLowerCase();
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      MonthlyBill.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber room department')
        .populate('generatedBy', 'fullName')
        .sort({ billYear: -1, billMonth: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MonthlyBill.countDocuments(filter),
    ]);

    return { bills, pagination: { total, page, limit } };
  }

  static async getBillById(organizationId, billId, actorUser) {
    const bill = await MonthlyBill.findOne({ _id: billId, organizationId })
      .populate('student', 'fullName hostelUid registrationNumber user')
      .populate('generatedBy', 'fullName');

    if (!bill) {
      throw new NotFoundError('Monthly bill not found');
    }

    if (actorUser.role === 'student' && bill.student.user.toString() !== actorUser._id.toString()) {
      throw new ForbiddenError('Access denied: You can only view your own bills.');
    }

    return bill;
  }

  static async getStudentBillSummary(organizationId, studentId, actorUser) {
    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (actorUser.role === 'student' && student.user.toString() !== actorUser._id.toString()) {
      throw new ForbiddenError('Access denied: You can only view your own ledger summary.');
    }

    const [bills, payments] = await Promise.all([
      MonthlyBill.find({ organizationId, student: student._id }).sort({ billYear: -1, billMonth: -1 }).lean(),
      Payment.find({ organizationId, student: student._id }).sort({ paymentDate: -1 }).lean(),
    ]);

    const totalBilled = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRemaining = bills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

    return {
      student: { id: student._id, fullName: student.fullName, hostelUid: student.hostelUid },
      totalBilled,
      totalPaid,
      totalRemaining,
      recentBills: bills.slice(0, 5),
      recentPayments: payments.slice(0, 5),
    };
  }

  static async generateMonthlyBills(organizationId, payload, actorUserId) {
    const { billMonth, billYear, baseRoomRent = 3000, baseMessFee = 2500, dailyMessRate = 80, utilityFee = 500 } = payload;
    if (!billMonth || !billYear) {
      throw new BadRequestError('billMonth (1-12) and billYear are required');
    }

    const m = Number(billMonth);
    const y = Number(billYear);
    if (m < 1 || m > 12) {
      throw new BadRequestError('billMonth must be between 1 and 12');
    }

    const activeStudents = await Student.find({
      organizationId,
      status: 'active',
      isHostelResident: true,
    });

    let generatedCount = 0;
    let totalBilledAmount = 0;
    let totalRebateDeductions = 0;

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

    for (const student of activeStudents) {
      const existing = await MonthlyBill.findOne({
        organizationId,
        student: student._id,
        billMonth: m,
        billYear: y,
      });

      if (existing) {
        continue;
      }

      const approvedLeaves = await LeaveRequest.find({
        organizationId,
        student: student._id,
        status: 'approved',
        fromDate: { $lte: endOfMonth },
        toDate: { $gte: startOfMonth },
      });

      let rebateDays = 0;
      approvedLeaves.forEach((leave) => {
        if (leave.daysCount >= 3) {
          rebateDays += leave.daysCount;
        }
      });

      const rebateCredit = rebateDays * dailyMessRate;
      const netBillAmount = Math.max(0, baseRoomRent + baseMessFee + utilityFee - rebateCredit);

      const priorBills = await MonthlyBill.find({
        organizationId,
        student: student._id,
        status: { $in: ['unpaid', 'partially_paid'] },
      });
      const priorArrears = priorBills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

      await MonthlyBill.create({
        organizationId,
        student: student._id,
        amount: netBillAmount,
        paidAmount: 0,
        remainingAmount: netBillAmount,
        billMonth: m,
        billYear: y,
        billingPeriod: `${y}-${String(m).padStart(2, '0')}`,
        dueDate: new Date(y, m - 1, 15),
        status: 'unpaid',
        generatedBy: actorUserId,
        description: `Base: ₹${baseRoomRent + baseMessFee + utilityFee} | Rebate Days: ${rebateDays} (-₹${rebateCredit}) | Prior Arrears: ₹${priorArrears}`,
      });

      generatedCount++;
      totalBilledAmount += netBillAmount;
      totalRebateDeductions += rebateCredit;
    }

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'MONTHLY_BILLS_GENERATED',
      'MonthlyBill',
      null,
      { month: m, year: y, count: generatedCount, totalAmount: totalBilledAmount }
    );

    return {
      billMonth: m,
      billYear: y,
      totalStudents: activeStudents.length,
      generatedCount,
      totalBilledAmount,
      totalRebateDeductions,
    };
  }

  static async verifyPeriod(organizationId, payload, actorUserId) {
    const { billingPeriod, isVerified } = payload;
    if (!billingPeriod) {
      throw new BadRequestError('Billing period (e.g. 2026-08) is required');
    }

    const verifiedState = isVerified !== undefined ? !!isVerified : true;
    const result = await MonthlyBill.updateMany(
      { organizationId, billingPeriod: billingPeriod.trim() },
      {
        $set: {
          isVerified: verifiedState,
          verifiedBy: actorUserId,
          verifiedAt: new Date(),
        },
      }
    );

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'BILLS_PERIOD_VERIFIED',
      'MonthlyBill',
      null,
      { billingPeriod, modifiedCount: result.modifiedCount, isVerified: verifiedState }
    );

    return {
      billingPeriod,
      isVerified: verifiedState,
      modifiedCount: result.modifiedCount,
      message: `Billing period ${billingPeriod} verified status updated`,
    };
  }

  static async updateBatch(organizationId, payload, actorUserId) {
    const { updates } = payload;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new BadRequestError('Updates array is required');
    }

    let modifiedCount = 0;
    for (const item of updates) {
      if (item._id) {
        const updateFields = {};
        if (item.amount !== undefined) {
          updateFields.amount = item.amount;
          updateFields.remainingAmount = Math.max(0, item.amount - (item.paidAmount || 0));
          updateFields.status = updateFields.remainingAmount === 0 ? 'paid' : item.paidAmount > 0 ? 'partially_paid' : 'unpaid';
        }
        if (item.dueDate) updateFields.dueDate = new Date(item.dueDate);
        if (item.description) updateFields.description = item.description;

        await MonthlyBill.updateOne({ _id: item._id, organizationId }, { $set: updateFields });
        modifiedCount++;
      }
    }

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'BILLS_BATCH_UPDATED',
      'MonthlyBill',
      null,
      { count: modifiedCount }
    );

    return { modifiedCount, message: `Batch updated ${modifiedCount} bills` };
  }
}

module.exports = BillingService;
