const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Organization = require('../models/Organization');
const User = require('../models/User');
const Student = require('../models/Student');
const Room = require('../models/Room');
const BedAllocation = require('../models/BedAllocation');
const MonthlyBill = require('../models/MonthlyBill');
const Payment = require('../models/Payment');

async function migrateTenantScope() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';
  await mongoose.connect(uri);
  console.log('[TENANT_MIGRATION] Connected to MongoDB.');

  const defaultOrg = await Organization.findOne({ slug: 'skyline-luxury' }) || await Organization.findOne();
  if (!defaultOrg) {
    console.error('[TENANT_MIGRATION] No tenant organization exists. Seed organizations first.');
    await mongoose.connection.close();
    return;
  }

  console.log(`[TENANT_MIGRATION] Backfilling missing organizationId with default tenant: ${defaultOrg.name} (${defaultOrg._id})`);

  const scopedModels = [User, Student, Room, BedAllocation, MonthlyBill, Payment];

  for (const Model of scopedModels) {
    const filter = { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] };
    if (Model === User) {
      filter.role = { $ne: 'super_admin' };
    }

    const count = await Model.countDocuments(filter);
    if (count > 0) {
      const res = await Model.updateMany(filter, { $set: { organizationId: defaultOrg._id } });
      console.log(`✓ Backfilled ${res.modifiedCount} legacy records in ${Model.modelName}`);
    } else {
      console.log(`✓ ${Model.modelName} has 0 legacy un-scoped records.`);
    }
  }

  await mongoose.connection.close();
  console.log('[TENANT_MIGRATION] Completed tenant backfill migration.');
}

if (require.main === module) {
  migrateTenantScope().catch(console.error);
}

module.exports = migrateTenantScope;
