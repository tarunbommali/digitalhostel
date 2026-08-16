const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

router.get(
  '/',
  requireRole(['super_admin', 'admin']),
  asyncHandler(auditLogController.listAuditLogs)
);

module.exports = router;
