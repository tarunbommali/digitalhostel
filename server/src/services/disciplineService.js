const FlagReport = require('../models/FlagReport');
const Student = require('../models/Student');
const {
  BadRequestError,
  NotFoundError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class DisciplineService {
  static async listFlags(organizationId, query = {}) {
    const filter = { organizationId };

    if (query.studentId) {
      filter.student = query.studentId;
    }
    if (query.status) {
      filter.status = query.status.toLowerCase();
    }
    if (query.flagType) {
      filter.flagType = query.flagType.toLowerCase();
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [flags, total] = await Promise.all([
      FlagReport.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber room phoneNumber')
        .populate('createdBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FlagReport.countDocuments(filter),
    ]);

    return { flags, pagination: { total, page, limit } };
  }

  static async createFlag(organizationId, studentId, payload, actorUserId) {
    const { flagType, description } = payload;
    if (!studentId || !flagType) {
      throw new BadRequestError('Student ID and flag type are required');
    }

    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const cleanType = flagType.toLowerCase().trim();
    const validTypes = ['discipline', 'billing', 'attendance', 'other'];
    if (!validTypes.includes(cleanType)) {
      throw new BadRequestError(`Invalid flag type. Allowed: [${validTypes.join(', ')}]`);
    }

    const flag = await FlagReport.create({
      organizationId,
      student: student._id,
      flagType: cleanType,
      description: description ? description.trim() : 'Incident recorded',
      status: 'open',
      createdBy: actorUserId,
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'FLAG_CREATED',
      'FlagReport',
      flag._id,
      { student: student.fullName, type: flag.flagType }
    );

    return flag;
  }

  static async updateFlagStatus(organizationId, flagId, status, actorUserId) {
    const cleanStatus = (status || '').toLowerCase().trim();
    const validStatuses = ['open', 'reviewing', 'resolved'];
    if (!validStatuses.includes(cleanStatus)) {
      throw new BadRequestError(`Invalid flag status. Allowed: [${validStatuses.join(', ')}]`);
    }

    const flag = await FlagReport.findOne({ _id: flagId, organizationId });
    if (!flag) {
      throw new NotFoundError('Disciplinary flag record not found');
    }

    flag.status = cleanStatus;
    await flag.save();

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'FLAG_STATUS_UPDATED',
      'FlagReport',
      flag._id,
      { status: flag.status }
    );

    return flag;
  }
}

module.exports = DisciplineService;
