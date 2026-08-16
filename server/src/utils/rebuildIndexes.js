const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const models = [
  require('../models/Organization'),
  require('../models/User'),
  require('../models/Student'),
  require('../models/Room'),
  require('../models/BedAllocation'),
  require('../models/MonthlyBill'),
  require('../models/Payment'),
  require('../models/PaymentAllocation'),
  require('../models/AttendanceSession'),
  require('../models/AttendanceRecord'),
  require('../models/LeaveRequest'),
  require('../models/FlagReport'),
  require('../models/AuditLog'),
  require('../models/Block'),
  require('../models/Department'),
  require('../models/AcademicYear'),
];

async function syncIndexes() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';
  await mongoose.connect(uri);
  console.log('[INDEX_SYNC] Connected to MongoDB. Synchronizing compound indexes...');

  for (const model of models) {
    try {
      console.log(`Synchronizing indexes for ${model.modelName}...`);
      await model.syncIndexes();
      console.log(`✓ ${model.modelName} indexes synchronized successfully.`);
    } catch (err) {
      console.error(`✗ Error synchronizing indexes for ${model.modelName}:`, err.message);
    }
  }

  await mongoose.connection.close();
  console.log('[INDEX_SYNC] Completed index synchronization.');
}

if (require.main === module) {
  syncIndexes().catch(console.error);
}

module.exports = syncIndexes;
