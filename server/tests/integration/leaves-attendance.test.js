const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const AttendanceSession = require('../../src/models/AttendanceSession');
const AttendanceRecord = require('../../src/models/AttendanceRecord');
const LeaveRequest = require('../../src/models/LeaveRequest');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Leaves & Attendance Workflows (FR-LEAVE-01, FR-ATTENDANCE-01)', () => {
  let org, adminUser, studentUser, student, attendanceStaff;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await AttendanceSession.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Department.deleteMany({});
    await AcademicYear.deleteMany({});

    org = await Organization.create({
      name: 'Skyline Luxury Hostel',
      slug: 'skyline-luxury',
      location: 'Bangalore',
      adminEmail: 'admin.skyline@hostel.edu',
    });

    adminUser = await User.create({
      email: 'admin.skyline@hostel.edu',
      password: 'Password123!',
      role: 'admin',
      fullName: 'Skyline Admin',
      organizationId: org._id,
      isActive: true,
    });

    attendanceStaff = await User.create({
      email: 'att.staff@hostel.edu',
      password: 'Password123!',
      role: 'moderator',
      moderatorType: 'attendance_only',
      fullName: 'Attendance Staff',
      organizationId: org._id,
      isActive: true,
    });

    const dept = await Department.create({ organizationId: org._id, name: 'CSE' });
    const year = await AcademicYear.create({ organizationId: org._id, name: '2026' });

    studentUser = await User.create({
      email: 'student.leave@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Leave Student',
      organizationId: org._id,
      isActive: true,
    });

    student = await Student.create({
      organizationId: org._id,
      user: studentUser._id,
      hostelUid: 'ATT-001',
      registrationNumber: 'REG-ATT-001',
      firstName: 'Att',
      lastName: 'Student',
      email: 'student.leave@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
      attendanceEligibility: true,
    });
  });

  test('Leave request calculates inclusive calendar days (Aug 10 to Aug 12 = 3 days)', async () => {
    const token = getAuthToken(studentUser);

    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromDate: '2026-08-10',
        toDate: '2026-08-12',
        reason: 'Attending hackathon in city center',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.daysCount).toBe(3);
    expect(res.body.data.status).toBe('pending');
  });

  test('Attendance scan prevents duplicate meal marking in same session', async () => {
    const token = getAuthToken(attendanceStaff);

    const session = await AttendanceSession.create({
      organizationId: org._id,
      attendanceDate: '2026-08-16',
      mealType: 'lunch',
    });

    // First scan succeeds
    const res1 = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId: session._id.toString(), studentId: student._id.toString() });

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Duplicate scan in same session is rejected with 409 Conflict
    const res2 = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId: session._id.toString(), studentId: student._id.toString() });

    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
  });
});
