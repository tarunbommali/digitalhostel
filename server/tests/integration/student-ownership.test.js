const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Student Record Ownership & IDOR Protection (FR-STUDENT-02)', () => {
  let org, user1, student1, user2, student2;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Department.deleteMany({});
    await AcademicYear.deleteMany({});

    org = await Organization.create({
      name: 'Skyline Luxury Hostel',
      slug: 'skyline-luxury',
      location: 'Bangalore',
      adminEmail: 'admin.skyline@hostel.edu',
    });

    const dept = await Department.create({ organizationId: org._id, name: 'CSE' });
    const year = await AcademicYear.create({ organizationId: org._id, name: '2026' });

    user1 = await User.create({
      email: 'student1@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Student One',
      organizationId: org._id,
      isActive: true,
    });

    student1 = await Student.create({
      organizationId: org._id,
      user: user1._id,
      hostelUid: 'SKY-001',
      registrationNumber: 'REG-001',
      firstName: 'Student',
      lastName: 'One',
      email: 'student1@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    user2 = await User.create({
      email: 'student2@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Student Two',
      organizationId: org._id,
      isActive: true,
    });

    student2 = await Student.create({
      organizationId: org._id,
      user: user2._id,
      hostelUid: 'SKY-002',
      registrationNumber: 'REG-002',
      firstName: 'Student',
      lastName: 'Two',
      email: 'student2@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });
  });

  test('Student 1 querying own overview receives 200 OK', async () => {
    const token1 = getAuthToken(user1);
    const res = await request(app)
      .get(`/api/students/${student1._id}/overview`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.hostelUid).toBe('SKY-001');
  });

  test('Student 1 querying peer Student 2 overview receives 403 Forbidden (IDOR Blocked)', async () => {
    const token1 = getAuthToken(user1);
    const res = await request(app)
      .get(`/api/students/${student2._id}/overview`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
