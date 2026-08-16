const OutingLog = require('../models/OutingLog');
const Student = require('../models/Student');
const FlagReport = require('../models/FlagReport');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class OutingService {
  static async getActiveOutings(organizationId) {
    return OutingLog.find({ organizationId, type: 'out', status: 'approved_exit' })
      .populate('student', 'fullName hostelUid registrationNumber phoneNumber gender photoUrl')
      .sort({ timestamp: -1 })
      .lean();
  }

  static async getOutingStats(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayExits, todayEntries, currentlyOut] = await Promise.all([
      OutingLog.countDocuments({ organizationId, type: 'out', timestamp: { $gte: today } }),
      OutingLog.countDocuments({ organizationId, type: 'in', timestamp: { $gte: today } }),
      OutingLog.countDocuments({ organizationId, type: 'out', status: 'approved_exit' }),
    ]);

    return {
      todayExits,
      todayEntries,
      currentlyOut,
    };
  }

  static async listOutings(organizationId, query = {}, actorUser) {
    const filter = { organizationId };

    if (actorUser.role === 'student') {
      const student = await Student.findOne({ user: actorUser._id, organizationId });
      if (!student) {
        throw new ForbiddenError('Student profile not associated with this account');
      }
      filter.student = student._id;
    } else if (query.studentId) {
      filter.student = query.studentId;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [outings, total] = await Promise.all([
      OutingLog.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber')
        .populate('guard', 'fullName email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OutingLog.countDocuments(filter),
    ]);

    return { outings, pagination: { total, page, limit } };
  }

  static async createOuting(organizationId, payload, actorUser) {
    let studentId = payload.studentId;
    if (actorUser.role === 'student') {
      const student = await Student.findOne({ user: actorUser._id, organizationId });
      if (!student) {
        throw new ForbiddenError('Student profile not found');
      }
      studentId = student._id;
    }

    if (!studentId) {
      throw new BadRequestError('Student ID is required');
    }

    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const outing = await OutingLog.create({
      organizationId,
      student: student._id,
      guard: actorUser._id,
      type: payload.type || 'out',
      purpose: payload.purpose ? payload.purpose.trim() : 'Local Outing',
      remarks: payload.remarks ? payload.remarks.trim() : '',
      status: 'approved_exit',
      timestamp: new Date(),
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUser._id,
      'OUTING_REQUESTED',
      'OutingLog',
      outing._id,
      { student: student.fullName, type: outing.type }
    );

    return outing;
  }

  static async scanPass(organizationId, payload, guardUser) {
    const { code, type, purpose } = payload;
    if (!code) {
      throw new BadRequestError('Verification code or student UID is required');
    }

    const cleanCode = code.trim();
    const student = await Student.findOne({
      organizationId,
      $or: [{ hostelUid: cleanCode }, { registrationNumber: cleanCode }],
    });

    if (!student) {
      throw new NotFoundError(`No student registered with ID '${cleanCode}'`);
    }

    const scanType = type || 'out';
    const outing = await OutingLog.create({
      organizationId,
      student: student._id,
      guard: guardUser._id,
      type: scanType,
      purpose: purpose || 'Gate Scan',
      status: scanType === 'out' ? 'approved_exit' : 'approved_entry',
      timestamp: new Date(),
    });

    return {
      success: true,
      scanType,
      student: {
        id: student._id,
        fullName: student.fullName,
        hostelUid: student.hostelUid,
        photoUrl: student.photoUrl,
      },
      scannedAt: outing.timestamp,
    };
  }
}

module.exports = OutingService;
