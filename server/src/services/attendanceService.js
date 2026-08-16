const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/Student');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class AttendanceService {
  static async listSessions(organizationId, date) {
    const filter = { organizationId };
    if (date) {
      filter.attendanceDate = date;
    }
    return AttendanceSession.find(filter).sort({ attendanceDate: -1, mealType: 1 }).lean();
  }

  static async createSession(organizationId, payload, actorUserId) {
    const { attendanceDate, mealType } = payload;
    if (!attendanceDate || !mealType) {
      throw new BadRequestError('Attendance date (YYYY-MM-DD) and meal type are required');
    }

    const cleanMeal = mealType.toLowerCase().trim();
    if (!['breakfast', 'lunch', 'dinner'].includes(cleanMeal)) {
      throw new BadRequestError('Meal type must be breakfast, lunch, or dinner');
    }

    const existing = await AttendanceSession.findOne({
      organizationId,
      attendanceDate: attendanceDate.trim(),
      mealType: cleanMeal,
    });

    if (existing) {
      return existing;
    }

    const session = await AttendanceSession.create({
      organizationId,
      attendanceDate: attendanceDate.trim(),
      mealType: cleanMeal,
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'SESSION_CREATED',
      'AttendanceSession',
      session._id,
      { date: session.attendanceDate, meal: session.mealType }
    );

    return session;
  }

  static async markAttendance(organizationId, payload, actorUserId) {
    let { sessionId, studentId, hostelUid, attendanceDate, mealType } = payload;

    let session;
    if (sessionId) {
      session = await AttendanceSession.findOne({ _id: sessionId, organizationId });
    } else if (attendanceDate && mealType) {
      session = await this.createSession(organizationId, { attendanceDate, mealType }, actorUserId);
    } else {
      const today = new Date().toISOString().split('T')[0];
      session = await this.createSession(organizationId, { attendanceDate: today, mealType: 'lunch' }, actorUserId);
    }

    if (!session) {
      throw new NotFoundError('Attendance session not found');
    }

    let student;
    if (studentId) {
      student = await Student.findOne({ _id: studentId, organizationId });
    } else if (hostelUid) {
      student = await Student.findOne({ hostelUid: hostelUid.trim(), organizationId });
    }

    if (!student) {
      throw new NotFoundError('Student not found for attendance scan');
    }

    if (!student.attendanceEligibility) {
      throw new BadRequestError('Student is not marked as eligible for mess attendance');
    }

    const existingRecord = await AttendanceRecord.findOne({
      organizationId,
      session: session._id,
      student: student._id,
    });

    if (existingRecord) {
      throw new ConflictError(`Student ${student.fullName} has already scanned for this ${session.mealType} session.`);
    }

    const record = await AttendanceRecord.create({
      organizationId,
      session: session._id,
      student: student._id,
      markedBy: actorUserId,
    });

    return {
      record,
      student: {
        id: student._id,
        fullName: student.fullName,
        hostelUid: student.hostelUid,
        room: student.room,
      },
      session: {
        id: session._id,
        mealType: session.mealType,
        attendanceDate: session.attendanceDate,
      },
    };
  }

  static async bulkMark(organizationId, payload, actorUserId) {
    const { sessionId, studentIds } = payload;
    if (!sessionId || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw new BadRequestError('Session ID and student IDs array are required');
    }

    const session = await AttendanceSession.findOne({ _id: sessionId, organizationId });
    if (!session) {
      throw new NotFoundError('Attendance session not found');
    }

    let marked = 0;
    for (const sid of studentIds) {
      try {
        await AttendanceRecord.findOneAndUpdate(
          { organizationId, session: session._id, student: sid },
          { $setOnInsert: { markedBy: actorUserId, createdAt: new Date() } },
          { upsert: true }
        );
        marked++;
      } catch {
        // Skip duplicate violations
      }
    }

    return { marked, totalSubmitted: studentIds.length };
  }

  static async queryRecords(organizationId, query = {}) {
    const filter = { organizationId };
    if (query.sessionId) {
      filter.session = query.sessionId;
    }
    if (query.studentId) {
      filter.student = query.studentId;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      AttendanceRecord.find(filter)
        .populate('student', 'fullName hostelUid registrationNumber')
        .populate('session', 'attendanceDate mealType')
        .populate('markedBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AttendanceRecord.countDocuments(filter),
    ]);

    return { records, pagination: { total, page, limit } };
  }

  static async getStats(organizationId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const totalStudents = await Student.countDocuments({ organizationId, status: 'active', isHostelResident: true });

    const sessions = await AttendanceSession.find({ organizationId, attendanceDate: targetDate }).lean();
    const sessionStats = [];

    for (const sess of sessions) {
      const scannedCount = await AttendanceRecord.countDocuments({ organizationId, session: sess._id });
      sessionStats.push({
        sessionId: sess._id,
        mealType: sess.mealType,
        scannedCount,
        turnoutPercentage: totalStudents > 0 ? Math.round((scannedCount / totalStudents) * 100) : 0,
      });
    }

    return {
      date: targetDate,
      totalEligibleStudents: totalStudents,
      sessions: sessionStats,
    };
  }
}

module.exports = AttendanceService;
