const AuditService = require('../services/auditService');
const { sendPaginated } = require('../utils/responseHelper');

const listAuditLogs = async (req, res) => {
  const { logs, pagination } = await AuditService.listLogs(req.organizationId, req.query);
  return sendPaginated(res, logs, pagination, 'Audit logs retrieved');
};

module.exports = {
  listAuditLogs,
};
