const mongoose = require('mongoose');

/**
 * Executes a multi-document operation within an atomic Mongoose Session Transaction
 * when running against a MongoDB replica set / Atlas cluster.
 * In production mode (NODE_ENV=production), transactions are strictly enforced.
 * In development / local testing mode, it gracefully executes with atomic model invariants.
 */
async function withTransaction(workFn) {
  const session = await mongoose.startSession();
  try {
    let result;
    let attemptedTx = false;

    try {
      session.startTransaction();
      attemptedTx = true;
      result = await workFn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      if (attemptedTx) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort failures on non-replica instances
        }
      }

      // Check if error is due to non-replica set topology
      const isTopologyError = err.message && (err.message.includes('replica set') || err.message.includes('Transaction numbers'));

      if (isTopologyError) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(
            '[PRODUCTION_TOPOLOGY_ERROR] MongoDB Replica Set required for ACID multi-document transactions in production. Standalone instances are prohibited.'
          );
        }
        // Development / local fallback
        return await workFn(null);
      }

      throw err;
    }
  } finally {
    session.endSession();
  }
}

module.exports = {
  withTransaction,
};
