const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const AuditLog = require('../../src/models/AuditLog');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Non-Blocking Audit Failure Isolation (FR-AUDIT-01)', () => {
  let org, adminUser, student;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await AuditLog.deleteMany({});
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

    const dept = await Department.create({ organizationId: org._id, name: 'CSE' });
    const year = await AcademicYear.create({ organizationId: org._id, name: '2026' });

    const userS = await User.create({
      email: 'student.audit@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Audit Student',
      organizationId: org._id,
      isActive: true,
    });

    student = await Student.create({
      organizationId: org._id,
      user: userS._id,
      hostelUid: 'AUD-001',
      registrationNumber: 'REG-AUD-001',
      firstName: 'Audit',
      lastName: 'Student',
      email: 'student.audit@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });
  });

  test('Business transaction succeeds even when AuditLog.create throws a persistence error', async () => {
    const token = getAuthToken(adminUser);

    // Mock AuditLog.create to throw
    const spy = jest.spyOn(AuditLog, 'create').mockRejectedValueOnce(new Error('Simulated Audit Cluster Failure'));

    const res = await request(app)
      .patch(`/api/students/${student._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'suspended' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedStudent = await Student.findById(student._id);
    expect(updatedStudent.status).toBe('suspended');

    spy.mockRestore();
  });
});
