const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Organization = require('./models/Organization');
const User = require('./models/User');
const Student = require('./models/Student');
const Room = require('./models/Room');
const BedAllocation = require('./models/BedAllocation');
const MonthlyBill = require('./models/MonthlyBill');
const Payment = require('./models/Payment');
const PaymentAllocation = require('./models/PaymentAllocation');
const AttendanceSession = require('./models/AttendanceSession');
const AttendanceRecord = require('./models/AttendanceRecord');
const LeaveRequest = require('./models/LeaveRequest');
const OutingLog = require('./models/OutingLog');
const FlagReport = require('./models/FlagReport');
const AuditLog = require('./models/AuditLog');
const Block = require('./models/Block');
const Department = require('./models/Department');
const AcademicYear = require('./models/AcademicYear');

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[SEED_BLOCKED] Seeding is strictly forbidden in production environment.');
  }

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'AdminPass123!';
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';

  console.log('[SEED_START] Connecting to MongoDB...');
  await mongoose.connect(uri);

  console.log('[SEED] Clearing collections for clean deterministic setup...');
  const collections = [
    Organization, User, Student, Room, BedAllocation, MonthlyBill,
    Payment, PaymentAllocation, AttendanceSession, AttendanceRecord,
    LeaveRequest, OutingLog, FlagReport, AuditLog, Block, Department, AcademicYear
  ];

  for (const model of collections) {
    await model.deleteMany({});
  }

  console.log('[SEED] 1. Creating Platform SuperAdmin...');
  const superAdmin = await User.create({
    email: 'superadmin@hostel.edu',
    password: defaultPassword,
    role: 'super_admin',
    fullName: 'System SuperAdmin',
    isActive: true,
  });

  console.log('[SEED] 2. Creating Tenant A: Skyline Luxury Hostel...');
  const orgA = await Organization.create({
    name: 'Skyline Luxury Hostel',
    slug: 'skyline-luxury',
    location: 'Bangalore Campus, North Wing',
    adminEmail: 'admin.skyline@hostel.edu',
    branding: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      tagline: 'Premium Smart Living & Student Residence',
    },
    settings: {
      maxStudents: 500,
      maxRooms: 150,
      maxStaff: 20,
    },
  });

  console.log('[SEED] 3. Creating Tenant B: Green Valley Hostel (Isolation Fixture)...');
  const orgB = await Organization.create({
    name: 'Green Valley Hostel',
    slug: 'green-valley',
    location: 'Pune Hills Campus, West Gate',
    adminEmail: 'admin.greenvalley@hostel.edu',
    branding: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      tagline: 'Eco-Friendly Campus Housing',
    },
    settings: {
      maxStudents: 300,
      maxRooms: 100,
      maxStaff: 15,
    },
  });

  console.log('[SEED] 4. Seeding Tenant A Staff & RBAC Hierarchy...');
  const adminA = await User.create({
    email: 'admin.skyline@hostel.edu',
    password: defaultPassword,
    role: 'admin',
    fullName: 'Skyline Chief Warden',
    organizationId: orgA._id,
    isActive: true,
  });

  const guardA = await User.create({
    email: 'guard.skyline@hostel.edu',
    password: defaultPassword,
    role: 'moderator',
    moderatorType: 'security_guard',
    fullName: 'Security Officer Kumar',
    organizationId: orgA._id,
    isActive: true,
  });

  const disciplineA = await User.create({
    email: 'discipline.skyline@hostel.edu',
    password: defaultPassword,
    role: 'moderator',
    moderatorType: 'discipline_monitor',
    fullName: 'Discipline Officer Sharma',
    organizationId: orgA._id,
    isActive: true,
  });

  const attendanceA = await User.create({
    email: 'attendance.skyline@hostel.edu',
    password: defaultPassword,
    role: 'moderator',
    moderatorType: 'attendance_only',
    fullName: 'Mess Supervisor Patel',
    organizationId: orgA._id,
    isActive: true,
  });

  // Tenant B Admin
  const adminB = await User.create({
    email: 'admin.greenvalley@hostel.edu',
    password: defaultPassword,
    role: 'admin',
    fullName: 'Green Valley Administrator',
    organizationId: orgB._id,
    isActive: true,
  });

  console.log('[SEED] 5. Seeding Lookups (Departments, Academic Years, Blocks)...');
  const deptCS = await Department.create({ organizationId: orgA._id, name: 'Computer Science', code: 'CSE' });
  const deptEC = await Department.create({ organizationId: orgA._id, name: 'Electronics Engineering', code: 'ECE' });
  const deptMech = await Department.create({ organizationId: orgA._id, name: 'Mechanical Engineering', code: 'MECH' });

  const deptB1 = await Department.create({ organizationId: orgB._id, name: 'Civil Engineering', code: 'CIVIL' });

  const year2026 = await AcademicYear.create({ organizationId: orgA._id, name: '2025-2026', isCurrent: true });
  const yearB2026 = await AcademicYear.create({ organizationId: orgB._id, name: '2025-2026', isCurrent: true });

  const blockAlpha = await Block.create({ organizationId: orgA._id, name: 'Alpha Block (Boys)', code: 'BLK-A', gender: 'boys' });
  const blockBeta = await Block.create({ organizationId: orgA._id, name: 'Beta Block (Girls)', code: 'BLK-B', gender: 'girls' });
  const blockB1 = await Block.create({ organizationId: orgB._id, name: 'Main Block', code: 'GV-M', gender: 'boys' });

  console.log('[SEED] 6. Seeding Rooms...');
  const room101 = await Room.create({ organizationId: orgA._id, roomNumber: '101', hostelBlock: 'Alpha Block (Boys)', capacity: 2, currentOccupants: 2, isOccupied: true });
  const room102 = await Room.create({ organizationId: orgA._id, roomNumber: '102', hostelBlock: 'Alpha Block (Boys)', capacity: 3, currentOccupants: 1, isOccupied: false });
  const room201 = await Room.create({ organizationId: orgA._id, roomNumber: '201', hostelBlock: 'Beta Block (Girls)', capacity: 2, currentOccupants: 1, isOccupied: false });

  const roomB501 = await Room.create({ organizationId: orgB._id, roomNumber: '501', hostelBlock: 'Main Block', capacity: 2, currentOccupants: 1, isOccupied: false });

  console.log('[SEED] 7. Seeding Students & Allocations...');
  // Student 1 (Tenant A)
  const userS1 = await User.create({
    email: 'tarun.student@hostel.edu',
    password: defaultPassword,
    role: 'student',
    fullName: 'Tarun Bommali',
    organizationId: orgA._id,
    isActive: true,
  });
  const student1 = await Student.create({
    organizationId: orgA._id,
    user: userS1._id,
    hostelUid: 'SKY-2026-001',
    registrationNumber: 'REG-2026-001',
    firstName: 'Tarun',
    lastName: 'Bommali',
    fullName: 'Tarun Bommali',
    email: 'tarun.student@hostel.edu',
    phoneNumber: '+919876543210',
    gender: 'male',
    programType: 'ug',
    department: deptCS._id,
    academicYear: year2026._id,
    yearOfStudy: 3,
    status: 'active',
    bloodGroup: 'O+',
  });

  // Student 2 (Tenant A)
  const userS2 = await User.create({
    email: 'rahul.verma@hostel.edu',
    password: defaultPassword,
    role: 'student',
    fullName: 'Rahul Verma',
    organizationId: orgA._id,
    isActive: true,
  });
  const student2 = await Student.create({
    organizationId: orgA._id,
    user: userS2._id,
    hostelUid: 'SKY-2026-002',
    registrationNumber: 'REG-2026-002',
    firstName: 'Rahul',
    lastName: 'Verma',
    fullName: 'Rahul Verma',
    email: 'rahul.verma@hostel.edu',
    phoneNumber: '+919876543211',
    gender: 'male',
    programType: 'ug',
    department: deptCS._id,
    academicYear: year2026._id,
    yearOfStudy: 3,
    status: 'active',
    bloodGroup: 'A+',
  });

  // Student 3 (Tenant A - Girl)
  const userS3 = await User.create({
    email: 'ananya.sharma@hostel.edu',
    password: defaultPassword,
    role: 'student',
    fullName: 'Ananya Sharma',
    organizationId: orgA._id,
    isActive: true,
  });
  const student3 = await Student.create({
    organizationId: orgA._id,
    user: userS3._id,
    hostelUid: 'SKY-2026-003',
    registrationNumber: 'REG-2026-003',
    firstName: 'Ananya',
    lastName: 'Sharma',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@hostel.edu',
    phoneNumber: '+919876543212',
    gender: 'female',
    programType: 'ug',
    department: deptEC._id,
    academicYear: year2026._id,
    yearOfStudy: 2,
    status: 'active',
    bloodGroup: 'B+',
  });

  // Student Tenant B
  const userB_S1 = await User.create({
    email: 'student.greenvalley@hostel.edu',
    password: defaultPassword,
    role: 'student',
    fullName: 'Green Valley Resident',
    organizationId: orgB._id,
    isActive: true,
  });
  const studentB1 = await Student.create({
    organizationId: orgB._id,
    user: userB_S1._id,
    hostelUid: 'GV-2026-001',
    registrationNumber: 'REG-GV-001',
    firstName: 'Green',
    lastName: 'Resident',
    fullName: 'Green Resident',
    email: 'student.greenvalley@hostel.edu',
    phoneNumber: '+919876543299',
    gender: 'male',
    programType: 'ug',
    department: deptB1._id,
    academicYear: yearB2026._id,
    yearOfStudy: 1,
    status: 'active',
  });

  // Bed Allocations
  await BedAllocation.create([
    { organizationId: orgA._id, student: student1._id, room: room101._id, bedNumber: '101-A', isCurrent: true },
    { organizationId: orgA._id, student: student2._id, room: room101._id, bedNumber: '101-B', isCurrent: true },
    { organizationId: orgA._id, student: student3._id, room: room201._id, bedNumber: '201-A', isCurrent: true },
    { organizationId: orgB._id, student: studentB1._id, room: roomB501._id, bedNumber: '501-A', isCurrent: true },
  ]);

  console.log('[SEED] 8. Seeding Monthly Bills & Payments...');
  const bill1 = await MonthlyBill.create({
    organizationId: orgA._id,
    student: student1._id,
    amount: 6000,
    paidAmount: 6000,
    remainingAmount: 0,
    billMonth: 7,
    billYear: 2026,
    billingPeriod: '2026-07',
    dueDate: new Date(2026, 6, 15),
    status: 'paid',
    generatedBy: adminA._id,
  });

  const bill2 = await MonthlyBill.create({
    organizationId: orgA._id,
    student: student1._id,
    amount: 6000,
    paidAmount: 0,
    remainingAmount: 6000,
    billMonth: 8,
    billYear: 2026,
    billingPeriod: '2026-08',
    dueDate: new Date(2026, 7, 15),
    status: 'unpaid',
    generatedBy: adminA._id,
  });

  const billB1 = await MonthlyBill.create({
    organizationId: orgB._id,
    student: studentB1._id,
    amount: 5500,
    paidAmount: 0,
    remainingAmount: 5500,
    billMonth: 8,
    billYear: 2026,
    billingPeriod: '2026-08',
    status: 'unpaid',
    generatedBy: adminB._id,
  });

  const payment1 = await Payment.create({
    organizationId: orgA._id,
    student: student1._id,
    amount: 6000,
    paymentMethod: 'sbi_collect',
    referenceId: 'SBI-REF-2026-07-001',
    transactionId: 'SBI-REF-2026-07-001',
    recordedBy: adminA._id,
  });

  await PaymentAllocation.create({
    organizationId: orgA._id,
    payment: payment1._id,
    bill: bill1._id,
    allocatedAmount: 6000,
  });

  const paymentB = await Payment.create({
    organizationId: orgB._id,
    student: studentB1._id,
    amount: 2500,
    paymentMethod: 'upi',
    referenceId: 'UPI-GV-2026-001',
    recordedBy: adminB._id,
  });

  console.log('[SEED] 9. Seeding Leaves, Outings, Attendance, Flags & Audit Logs...');
  await LeaveRequest.create({
    organizationId: orgA._id,
    student: student1._id,
    fromDate: new Date(2026, 7, 10),
    toDate: new Date(2026, 7, 13),
    daysCount: 4,
    reason: 'Family Event',
    status: 'approved',
    approvedBy: adminA._id,
    approvedAt: new Date(),
  });

  await OutingLog.create({
    organizationId: orgA._id,
    student: student1._id,
    guard: guardA._id,
    type: 'out',
    purpose: 'Library Visit',
    status: 'approved_exit',
    timestamp: new Date(),
  });

  const session = await AttendanceSession.create({
    organizationId: orgA._id,
    attendanceDate: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    status: 'open',
  });

  await AttendanceRecord.create({
    organizationId: orgA._id,
    session: session._id,
    student: student1._id,
    markedBy: attendanceA._id,
  });

  await FlagReport.create({
    organizationId: orgA._id,
    student: student2._id,
    flagType: 'discipline',
    description: 'Late entry beyond hostel curfew hours (10:30 PM)',
    status: 'open',
    createdBy: disciplineA._id,
  });

  await AuditLog.create({
    organizationId: orgA._id,
    user: adminA._id,
    action: 'SYSTEM_SEED',
    entityType: 'Organization',
    entityId: orgA._id.toString(),
    details: { event: 'Multi-tenant database initialized with deterministic seed fixtures' },
  });

  console.log('[SEED_COMPLETE] ✓ Successfully seeded database with SuperAdmin and isolated Tenant A / Tenant B fixtures.');
  await mongoose.connection.close();
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[SEED_ERROR]', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
