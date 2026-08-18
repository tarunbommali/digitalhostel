const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const Room = require('../../src/models/Room');
const MonthlyBill = require('../../src/models/MonthlyBill');
const Payment = require('../../src/models/Payment');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Multi-Tenant Data Isolation (FR-TENANT-01)', () => {
  let orgA, orgB, adminA, adminB, studentB, roomB, billB, paymentB;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Room.deleteMany({});
    await MonthlyBill.deleteMany({});
    await Payment.deleteMany({});
    await Department.deleteMany({});
    await AcademicYear.deleteMany({});

    // Tenant A
    orgA = await Organization.create({
      name: 'Skyline Luxury Hostel',
      slug: 'skyline-luxury',
      location: 'Bangalore',
      adminEmail: 'admin.skyline@hostel.edu',
      plan: 'ENTERPRISE',
    });
    adminA = await User.create({
      email: 'admin.skyline@hostel.edu',
      password: 'Password123!',
      role: 'admin',
      fullName: 'Skyline Admin',
      organizationId: orgA._id,
      isActive: true,
    });

    // Tenant B
    orgB = await Organization.create({
      name: 'Green Valley Hostel',
      slug: 'green-valley',
      location: 'Pune',
      adminEmail: 'admin.greenvalley@hostel.edu',
      plan: 'ENTERPRISE',
    });
    adminB = await User.create({
      email: 'admin.greenvalley@hostel.edu',
      password: 'Password123!',
      role: 'admin',
      fullName: 'Green Valley Admin',
      organizationId: orgB._id,
      isActive: true,
    });

    const deptB = await Department.create({ organizationId: orgB._id, name: 'Civil' });
    const yearB = await AcademicYear.create({ organizationId: orgB._id, name: '2026' });

    const userB = await User.create({
      email: 'student.b@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Tenant B Student',
      organizationId: orgB._id,
      isActive: true,
    });

    studentB = await Student.create({
      organizationId: orgB._id,
      user: userB._id,
      hostelUid: 'GV-001',
      registrationNumber: 'REG-GV-001',
      firstName: 'Tenant',
      lastName: 'B',
      email: 'student.b@hostel.edu',
      programType: 'ug',
      department: deptB._id,
      academicYear: yearB._id,
      gender: 'male',
      status: 'active',
    });

    roomB = await Room.create({
      organizationId: orgB._id,
      roomNumber: '501',
      hostelBlock: 'Main Block',
      capacity: 2,
    });

    billB = await MonthlyBill.create({
      organizationId: orgB._id,
      student: studentB._id,
      amount: 5000,
      paidAmount: 0,
      remainingAmount: 5000,
      billMonth: 8,
      billYear: 2026,
      billingPeriod: '2026-08',
      status: 'unpaid',
      generatedBy: adminB._id,
    });

    paymentB = await Payment.create({
      organizationId: orgB._id,
      student: studentB._id,
      amount: 2500,
      paymentMethod: 'upi',
      referenceId: 'UPI-GV-TEST-001',
      recordedBy: adminB._id,
    });
  });

  test('Tenant A admin querying /api/students/:id for Tenant B student returns 404', async () => {
    const tokenA = getAuthToken(adminA);
    const res = await request(app)
      .get(`/api/students/${studentB._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });

  test('Tenant A admin querying /api/bills/:id for Tenant B bill returns 404', async () => {
    const tokenA = getAuthToken(adminA);
    const res = await request(app)
      .get(`/api/bills/${billB._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });

  test('Tenant A admin querying /api/rooms list does not contain Tenant B rooms', async () => {
    const tokenA = getAuthToken(adminA);
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const roomNumbers = res.body.data.map((r) => r.roomNumber);
    expect(roomNumbers).not.toContain('501');
  });

  test('Tenant A admin querying /api/payments list does not contain Tenant B payments', async () => {
    const tokenA = getAuthToken(adminA);
    const res = await request(app)
      .get('/api/payments')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const paymentIds = res.body.data.map((p) => p._id.toString());
    expect(paymentIds).not.toContain(paymentB._id.toString());
  });
});
