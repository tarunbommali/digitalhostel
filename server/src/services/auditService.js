const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Non-blocking, failure-isolated audit logging
   */
  static async recordAuditSafe(organizationId, actorUserId, action, entityType, entityId = null, details = null) {
    try {
      await AuditLog.create({
        organizationId,
        user: actorUserId,
        action,
        entityType,
        entityId: entityId ? entityId.toString() : null,
        details,
      });
    } catch (err) {
      console.error('[AUDIT_PERSISTENCE_WARNING]', {
        error: err.message,
        action,
        entityType,
        entityId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async listLogs(organizationId, query = {}) {
    const filter = {};
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    if (query.action) {
      filter.action = query.action;
    }
    if (query.entityType) {
      filter.entityType = query.entityType;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, pagination: { total, page, limit } };
  }
}

module.exports = AuditService;
