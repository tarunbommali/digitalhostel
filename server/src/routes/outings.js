const express = require('express');
const router = express.Router();
const outingController = require('../controllers/outingController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

// 1. Static Routes
router.get('/active', asyncHandler(outingController.getActiveOutings));
router.get('/stats', asyncHandler(outingController.getOutingStats));

router.post(
  '/scan',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['security_guard', 'full']),
  asyncHandler(outingController.scanPass)
);

// Backward-compatible aliases for scanner
router.post(
  '/verify-scan',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['security_guard', 'full']),
  asyncHandler(outingController.scanPass)
);

router.post(
  '/record',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['security_guard', 'full']),
  asyncHandler(outingController.scanPass)
);

// 2. Outing List & Request
router.get('/', asyncHandler(outingController.listOutings));
router.post('/', asyncHandler(outingController.createOuting));

module.exports = router;
