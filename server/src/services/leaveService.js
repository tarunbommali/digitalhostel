const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class LeaveService {
  static calculateInclusiveDays(fromDateStr, toDateStr) {
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestError('Invalid date format for leave request');
    }

    if (from > to) {
      throw new BadRequestError('From date must be earlier than or equal to To date');
    }

    // Inclusive calendar day formula
    const diffMs = to.getTime() - from.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return { from, to, daysCount: days };
  }

  static async listLeaves(organizationId, query = {}, actorUser) {
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

    if (query.status) {
      filter.status = query.status.toLowerCase();
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [leaves, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber phoneNumber gender')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeaveRequest.countDocuments(filter),
    ]);

    return { leaves, pagination: { total, page, limit } };
  }

  static async submitLeave(organizationId, payload, actorUser) {
    let studentId = payload.studentId;
    if (actorUser.role === 'student') {
      const student = await Student.findOne({ user: actorUser._id, organizationId });
      if (!student) {
        throw new ForbiddenError('Student profile not found');
      }
      studentId = student._id;
    }

    if (!studentId || !payload.fromDate || !payload.toDate || !payload.reason) {
      throw new BadRequestError('Student ID, fromDate, toDate, and reason are required');
    }

    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const { from, to, daysCount } = this.calculateInclusiveDays(payload.fromDate, payload.toDate);

    const leave = await LeaveRequest.create({
      organizationId,
      student: student._id,
      fromDate: from,
      toDate: to,
      daysCount,
      reason: payload.reason.trim(),
      status: 'pending',
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUser._id,
      'LEAVE_REQUESTED',
      'LeaveRequest',
      leave._id,
      { student: student.fullName, days: daysCount }
    );

    return leave;
  }

  static async getLeaveById(organizationId, leaveId, actorUser) {
    const leave = await LeaveRequest.findOne({ _id: leaveId, organizationId })
      .populate('student', 'fullName hostelUid registrationNumber user')
      .populate('approvedBy', 'fullName email');

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    if (actorUser.role === 'student' && leave.student.user.toString() !== actorUser._id.toString()) {
      throw new ForbiddenError('Access denied: You can only view your own leave requests.');
    }

    return leave;
  }

  static async reviewLeave(organizationId, leaveId, status, actorUser) {
    const cleanStatus = status.toLowerCase().trim();
    if (!['approved', 'rejected'].includes(cleanStatus)) {
      throw new BadRequestError("Leave status must be 'approved' or 'rejected'");
    }

    const leave = await LeaveRequest.findOne({ _id: leaveId, organizationId });
    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    leave.status = cleanStatus;
    leave.approvedBy = actorUser._id;
    leave.approvedAt = new Date();
    await leave.save();

    AuditService.recordAuditSafe(
      organizationId,
      actorUser._id,
      'LEAVE_REVIEWED',
      'LeaveRequest',
      leave._id,
      { status: leave.status, days: leave.daysCount }
    );

    return leave;
  }
}

module.exports = LeaveService;
