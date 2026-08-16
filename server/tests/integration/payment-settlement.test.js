const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const MonthlyBill = require('../../src/models/MonthlyBill');
const Payment = require('../../src/models/Payment');
const PaymentAllocation = require('../../src/models/PaymentAllocation');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Payment Multi-Bill Chronological Settlement (FR-PAYMENT-02)', () => {
  let org, adminUser, student, bill1, bill2;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await MonthlyBill.deleteMany({});
    await Payment.deleteMany({});
    await PaymentAllocation.deleteMany({});
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

    const dept = await Department.create({ organizationId: org._id, name: 'Computer Science' });
    const year = await AcademicYear.create({ organizationId: org._id, name: '2026' });

    const userS = await User.create({
      email: 'student.pay@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Paying Student',
      organizationId: org._id,
      isActive: true,
    });

    student = await Student.create({
      organizationId: org._id,
      user: userS._id,
      hostelUid: 'PAY-001',
      registrationNumber: 'REG-PAY-001',
      firstName: 'Pay',
      lastName: 'Student',
      email: 'student.pay@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    // Bill 1: Month 6 ($300, unpaid)
    bill1 = await MonthlyBill.create({
      organizationId: org._id,
      student: student._id,
      amount: 300,
      paidAmount: 0,
      remainingAmount: 300,
      billMonth: 6,
      billYear: 2026,
      billingPeriod: '2026-06',
      status: 'unpaid',
      generatedBy: adminUser._id,
    });

    // Bill 2: Month 7 ($400, unpaid)
    bill2 = await MonthlyBill.create({
      organizationId: org._id,
      student: student._id,
      amount: 400,
      paidAmount: 0,
      remainingAmount: 400,
      billMonth: 7,
      billYear: 2026,
      billingPeriod: '2026-07',
      status: 'unpaid',
      generatedBy: adminUser._id,
    });
  });

  test('Recording a $500 payment settles Bill 1 ($300, paid) and partially settles Bill 2 ($200 remaining)', async () => {
    const token = getAuthToken(adminUser);

    const res = await request(app)
      .post('/api/payments/record')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: student._id.toString(),
        amount: 500,
        paymentMethod: 'sbi_collect',
        referenceId: 'SBI-SETTLE-TEST-999',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const updatedBill1 = await MonthlyBill.findById(bill1._id);
    const updatedBill2 = await MonthlyBill.findById(bill2._id);

    expect(updatedBill1.status).toBe('paid');
    expect(updatedBill1.paidAmount).toBe(300);
    expect(updatedBill1.remainingAmount).toBe(0);

    expect(updatedBill2.status).toBe('partially_paid');
    expect(updatedBill2.paidAmount).toBe(200);
    expect(updatedBill2.remainingAmount).toBe(200);

    const allocations = await PaymentAllocation.find({ payment: res.body.data.payment._id }).sort({ createdAt: 1 });
    expect(allocations).toHaveLength(2);
    expect(allocations[0].bill.toString()).toBe(bill1._id.toString());
    expect(allocations[0].allocatedAmount).toBe(300);
    expect(allocations[1].bill.toString()).toBe(bill2._id.toString());
    expect(allocations[1].allocatedAmount).toBe(200);
  });
});
