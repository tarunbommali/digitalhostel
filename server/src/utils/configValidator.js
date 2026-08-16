const mongoose = require('mongoose');

/**
 * Validates production environment configuration and MongoDB replica set topology.
 * Fails fast before the server starts accepting HTTP traffic.
 */
function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return; // Allow permissive defaults in development / test environments
  }

  const errors = [];

  // 1. Mandatory Environment Variables
  const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'CORS_ORIGIN',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      errors.push(`Missing required production environment variable: ${envVar}`);
    }
  }

  // 2. Secret Strength Check
  if (process.env.JWT_SECRET) {
    const weakSecrets = [
      'fallback_jwt_secret_dev_key',
      'secret',
      'jwt_secret',
      'password',
      '123456',
      'change_me_in_production',
    ];
    if (weakSecrets.includes(process.env.JWT_SECRET.toLowerCase()) || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET is too weak or using default placeholder. Must be at least 32 characters long in production.');
    }
  }

  // 3. CORS Production Configuration
  if (process.env.CORS_ORIGIN === '*') {
    errors.push('Wildcard CORS_ORIGIN="*" is strictly prohibited in production.');
  }

  if (errors.length > 0) {
    console.error('\n======================================================');
    console.error(' [FATAL] PRODUCTION CONFIGURATION VALIDATION FAILED:');
    errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
    console.error('======================================================\n');
    process.exit(1);
  }
}

/**
 * Verifies that the connected MongoDB topology supports Replica Set transactions in production.
 */
async function verifyProductionDatabaseTopology() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    const adminDb = mongoose.connection.db.admin();
    const isMaster = await adminDb.command({ isMaster: 1 });
    const isReplicaSet = !!(isMaster.setName || isMaster.msg === 'isdbgrid');

    if (!isReplicaSet) {
      console.error('\n======================================================');
      console.error(' [FATAL] PRODUCTION DATABASE TOPOLOGY CHECK FAILED:');
      console.error('  Standalone MongoDB detected in production mode.');
      console.error('  Multi-document transactions require a Replica Set (e.g. MongoDB Atlas / cluster).');
      console.error('======================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.warn('[TOPOLOGY_CHECK_WARNING] Could not determine replica set status:', err.message);
  }
}

module.exports = {
  validateProductionConfig,
  verifyProductionDatabaseTopology,
};
