const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const { getAuthToken } = require('../setup');

describe('Integration: RBAC Hierarchy & Moderator Capabilities (FR-AUTH-03)', () => {
  let org, adminUser, guardUser, attendanceUser, studentUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});

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

    guardUser = await User.create({
      email: 'guard.skyline@hostel.edu',
      password: 'Password123!',
      role: 'moderator',
      moderatorType: 'security_guard',
      fullName: 'Security Guard',
      organizationId: org._id,
      isActive: true,
    });

    attendanceUser = await User.create({
      email: 'attendance.skyline@hostel.edu',
      password: 'Password123!',
      role: 'moderator',
      moderatorType: 'attendance_only',
      fullName: 'Attendance Staff',
      organizationId: org._id,
      isActive: true,
    });

    studentUser = await User.create({
      email: 'student.skyline@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Student User',
      organizationId: org._id,
      isActive: true,
    });
  });

  test('Student calling Admin endpoints (/api/moderators) receives 403 Forbidden', async () => {
    const token = getAuthToken(studentUser);
    const res = await request(app)
      .get('/api/moderators')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Attendance moderator calling gate pass scanner receives 403 Forbidden', async () => {
    const token = getAuthToken(attendanceUser);
    const res = await request(app)
      .post('/api/outings/scan')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'SKY-001' });

    expect(res.status).toBe(403);
  });

  test('Security guard calling attendance marking receives 403 Forbidden', async () => {
    const token = getAuthToken(guardUser);
    const res = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ hostelUid: 'SKY-001' });

    expect(res.status).toBe(403);
  });

  test('Admin calling staff creation succeeds with 201', async () => {
    const token = getAuthToken(adminUser);
    const res = await request(app)
      .post('/api/moderators')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'new.guard@hostel.edu',
        fullName: 'New Security Officer',
        role: 'moderator',
        moderatorType: 'security_guard',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('moderator');
  });
});
