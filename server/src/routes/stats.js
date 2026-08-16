const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

router.get(
  '/dashboard',
  requireRole(['admin', 'moderator']),
  asyncHandler(statsController.getDashboardStats)
);

// Backward-compatible alias for root stats
router.get(
  '/',
  requireRole(['admin', 'moderator']),
  asyncHandler(statsController.getDashboardStats)
);

module.exports = router;
