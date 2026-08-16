const Student = require('../models/Student');
const User = require('../models/User');
const BedAllocation = require('../models/BedAllocation');
const MonthlyBill = require('../models/MonthlyBill');
const LeaveRequest = require('../models/LeaveRequest');
const AttendanceRecord = require('../models/AttendanceRecord');
const Organization = require('../models/Organization');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../utils/responseHelper');
const { escapeRegex } = require('../utils/regexHelper');
const AuditService = require('./auditService');

class StudentService {
  static assertStudentAccess(studentDoc, actorUser) {
    if (!studentDoc) return;
    if (actorUser.role === 'student' && studentDoc.user.toString() !== actorUser._id.toString()) {
      throw new ForbiddenError('Access denied: You can only view your own student record.');
    }
  }

  static async listStudents(organizationId, query = {}) {
    const filter = { organizationId };

    if (query.department) {
      filter.department = query.department;
    }
    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }
    if (query.status) {
      filter.status = query.status.toLowerCase();
    }
    if (query.gender) {
      filter.gender = query.gender.toLowerCase();
    }

    if (query.search) {
      const safeSearch = escapeRegex(query.search);
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { hostelUid: { $regex: safeSearch, $options: 'i' } },
        { registrationNumber: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('department', 'name code')
        .populate('academicYear', 'name isCurrent')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    // Attach active bed allocations for listed students
    const studentIds = students.map((s) => s._id);
    const allocations = await BedAllocation.find({
      organizationId,
      student: { $in: studentIds },
      isCurrent: true,
    })
      .populate('room', 'roomNumber hostelBlock')
      .lean();

    const allocMap = new Map();
    allocations.forEach((a) => {
      allocMap.set(a.student.toString(), a);
    });

    const enrichedStudents = students.map((s) => ({
      ...s,
      activeAllocation: allocMap.get(s._id.toString()) || null,
    }));

    return { students: enrichedStudents, pagination: { total, page, limit } };
  }

  static async getStudentById(organizationId, studentId, actorUser) {
    const student = await Student.findOne({ _id: studentId, organizationId })
      .populate('department', 'name code')
      .populate('academicYear', 'name isCurrent')
      .populate('user', 'email fullName isActive lastLoginAt');

    if (!student) {
      throw new NotFoundError('Student record not found in this organization');
    }

    this.assertStudentAccess(student, actorUser);

    const activeAllocation = await BedAllocation.findOne({
      organizationId,
      student: student._id,
      isCurrent: true,
    }).populate('room', 'roomNumber hostelBlock capacity');

    return {
      ...student.toJSON(),
      activeAllocation,
    };
  }

  static async createStudent(organizationId, payload, actorUserId) {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Tenant organization not found');
    }

    // Quota Enforcement
    const currentCount = await Student.countDocuments({ organizationId, status: 'active' });
    const maxStudents = org.settings?.maxStudents || 500;
    if (currentCount >= maxStudents) {
      throw new BadRequestError(`Organization student quota reached (${maxStudents} students max)`);
    }

    const {
      hostelUid,
      registrationNumber,
      firstName,
      lastName,
      email,
      password,
      gender,
      programType,
      department,
      academicYear,
      yearOfStudy,
      phoneNumber,
      bloodGroup,
      guardianName,
      guardianPhone,
      emergencyContact,
    } = payload;

    if (!hostelUid || !registrationNumber || !firstName || !email || !department || !academicYear) {
      throw new BadRequestError('Required fields missing for student enrollment');
    }

    // Check duplicate unique keys in tenant
    const existing = await Student.findOne({
      organizationId,
      $or: [
        { hostelUid: hostelUid.trim() },
        { registrationNumber: registrationNumber.trim() },
        { email: email.toLowerCase().trim() },
      ],
    });

    if (existing) {
      throw new ConflictError('A student with this hostel UID, registration number, or email already exists');
    }

    const cleanEmail = email.toLowerCase().trim();
    const fullName = `${firstName.trim()} ${lastName ? lastName.trim() : ''}`.trim();

    // Create user login account for student
    let user = await User.findOne({ organizationId, email: cleanEmail });
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        password: password || 'StudentPass123!',
        role: 'student',
        fullName,
        phoneNumber,
        organizationId,
        isActive: true,
      });
    }

    const student = await Student.create({
      organizationId,
      user: user._id,
      hostelUid: hostelUid.trim(),
      registrationNumber: registrationNumber.trim(),
      studentId: registrationNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      fullName,
      email: cleanEmail,
      phoneNumber,
      phone: phoneNumber,
      gender: gender || 'male',
      programType: programType || 'ug',
      department,
      academicYear,
      yearOfStudy: yearOfStudy || 1,
      bloodGroup: bloodGroup || 'B+',
      guardianName,
      guardianPhone,
      emergencyContact,
      status: 'active',
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'STUDENT_CREATED',
      'Student',
      student._id,
      { hostelUid: student.hostelUid, name: student.fullName }
    );

    return student;
  }

  static async updateStudent(organizationId, studentId, payload, actorUserId) {
    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const permittedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'phone',
      'gender',
      'programType',
      'department',
      'academicYear',
      'yearOfStudy',
      'bloodGroup',
      'guardianName',
      'guardianPhone',
      'emergencyContact',
      'photoUrl',
      'attendanceEligibility',
      'messStatus',
    ];

    permittedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        student[field] = payload[field];
      }
    });

    await student.save();

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'STUDENT_UPDATED',
      'Student',
      student._id
    );

    return student;
  }

  static async updateStatus(organizationId, studentId, status, actorUserId) {
    const validStatuses = ['active', 'suspended', 'graduated', 'transferred'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(`Invalid student status. Allowed: [${validStatuses.join(', ')}]`);
    }

    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    student.status = status.toLowerCase();
    await student.save();

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'STUDENT_STATUS_UPDATED',
      'Student',
      student._id,
      { status: student.status }
    );

    return student;
  }

  static async renewPass(organizationId, studentId, actorUserId) {
    const student = await Student.findOne({ _id: studentId, organizationId });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const currentExpiry = student.cardValidUntil ? new Date(student.cardValidUntil) : new Date();
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    student.cardValidUntil = newExpiry;
    student.cardIssuedDate = new Date();
    await student.save();

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'STUDENT_PASS_RENEWED',
      'Student',
      student._id,
      { validUntil: student.cardValidUntil }
    );

    return {
      message: 'Student digital hostel pass renewed for 1 year',
      cardValidUntil: student.cardValidUntil,
      student,
    };
  }

  static async getStudentOverview(organizationId, studentId, actorUser) {
    const student = await Student.findOne({ _id: studentId, organizationId })
      .populate('department', 'name code')
      .populate('academicYear', 'name');

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    this.assertStudentAccess(student, actorUser);

    const [activeAllocation, recentAttendance, latestBills, activeLeaves] = await Promise.all([
      BedAllocation.findOne({ organizationId, student: student._id, isCurrent: true }).populate(
        'room',
        'roomNumber hostelBlock'
      ),
      AttendanceRecord.find({ organizationId, student: student._id })
        .populate('session', 'attendanceDate mealType')
        .sort({ createdAt: -1 })
        .limit(15),
      MonthlyBill.find({ organizationId, student: student._id })
        .sort({ billYear: -1, billMonth: -1 })
        .limit(6),
      LeaveRequest.find({ organizationId, student: student._id })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalDue = latestBills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

    return {
      student,
      activeAllocation,
      recentAttendance,
      latestBills,
      activeLeaves,
      totalDue,
    };
  }

  static async bulkImport(organizationId, roster = [], actorUserId) {
    if (!Array.isArray(roster) || roster.length === 0) {
      throw new BadRequestError('Roster must be a non-empty array');
    }

    let imported = 0;
    const errors = [];

    for (let i = 0; i < roster.length; i++) {
      try {
        await this.createStudent(organizationId, roster[i], actorUserId);
        imported++;
      } catch (err) {
        errors.push({ index: i, identifier: roster[i]?.hostelUid || i, error: err.message });
      }
    }

    return { imported, failed: errors.length, errors };
  }
}

module.exports = StudentService;
