const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const Room = require('../../src/models/Room');
const BedAllocation = require('../../src/models/BedAllocation');
const Department = require('../../src/models/Department');
const AcademicYear = require('../../src/models/AcademicYear');
const { getAuthToken } = require('../setup');

describe('Integration: Room Allocation Concurrency & Capacity (FR-ROOM-02-RC)', () => {
  let org, adminUser, targetRoom, studentA, studentB;

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
    await BedAllocation.deleteMany({});
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

    // 2 Static Occupants for Bed 102-A and 102-B
    const userOcc1 = await User.create({
      email: 'occ1@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Occupant 1',
      organizationId: org._id,
    });
    const occ1 = await Student.create({
      organizationId: org._id,
      user: userOcc1._id,
      hostelUid: 'OCC-001',
      registrationNumber: 'REG-OCC-001',
      firstName: 'Occ',
      lastName: '1',
      email: 'occ1@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    const userOcc2 = await User.create({
      email: 'occ2@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Occupant 2',
      organizationId: org._id,
    });
    const occ2 = await Student.create({
      organizationId: org._id,
      user: userOcc2._id,
      hostelUid: 'OCC-002',
      registrationNumber: 'REG-OCC-002',
      firstName: 'Occ',
      lastName: '2',
      email: 'occ2@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    // 2 Dedicated Competitor Students (no active allocations)
    const userA = await User.create({
      email: 'compete.a@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Competitor A',
      organizationId: org._id,
    });
    studentA = await Student.create({
      organizationId: org._id,
      user: userA._id,
      hostelUid: 'COMP-001',
      registrationNumber: 'REG-COMP-001',
      firstName: 'Comp',
      lastName: 'A',
      email: 'compete.a@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    const userB = await User.create({
      email: 'compete.b@hostel.edu',
      password: 'Password123!',
      role: 'student',
      fullName: 'Competitor B',
      organizationId: org._id,
    });
    studentB = await Student.create({
      organizationId: org._id,
      user: userB._id,
      hostelUid: 'COMP-002',
      registrationNumber: 'REG-COMP-002',
      firstName: 'Comp',
      lastName: 'B',
      email: 'compete.b@hostel.edu',
      programType: 'ug',
      department: dept._id,
      academicYear: year._id,
      gender: 'male',
      status: 'active',
    });

    // Room 102: Capacity 3, 2 current occupants
    targetRoom = await Room.create({
      organizationId: org._id,
      roomNumber: '102',
      hostelBlock: 'Alpha Block',
      capacity: 3,
      currentOccupants: 2,
    });

    await BedAllocation.create([
      { organizationId: org._id, student: occ1._id, room: targetRoom._id, bedNumber: '102-A', isCurrent: true },
      { organizationId: org._id, student: occ2._id, room: targetRoom._id, bedNumber: '102-B', isCurrent: true },
    ]);
  });

  test('Concurrent allocation for 1 remaining bed slot produces exactly 1 winner and 1 rejection', async () => {
    const token = getAuthToken(adminUser);

    const reqA = request(app)
      .post('/api/rooms/allocate')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: studentA._id.toString(), roomId: targetRoom._id.toString(), bedNumber: '102-C' });

    const reqB = request(app)
      .post('/api/rooms/allocate')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: studentB._id.toString(), roomId: targetRoom._id.toString(), bedNumber: '102-C' });

    const [resA, resB] = await Promise.all([reqA, reqB]);
    const responses = [resA, resB];

    const successes = responses.filter((r) => r.status === 200 || r.status === 201);
    const failures = responses.filter((r) => r.status === 409 || r.status === 400);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    // Verify room occupancy incremented by 1 (to exactly 3)
    const updatedRoom = await Room.findById(targetRoom._id);
    expect(updatedRoom.currentOccupants).toBe(3);

    // Verify total active allocations in room equals 3
    const activeAllocations = await BedAllocation.find({ room: targetRoom._id, isCurrent: true });
    expect(activeAllocations).toHaveLength(3);

    // Verify exactly one allocation for 102-C
    const slot102C = await BedAllocation.find({ room: targetRoom._id, bedNumber: '102-C', isCurrent: true });
    expect(slot102C).toHaveLength(1);
  });
});
