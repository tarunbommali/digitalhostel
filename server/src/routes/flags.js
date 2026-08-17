const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

const { requirePlanFeature } = require('../middleware/planGuard');

router.use(authMiddleware, tenantGuard, requirePlanFeature('incidentReporting'));

router.get(
  '/',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['discipline_monitor', 'administration', 'full']),
  asyncHandler(flagController.listFlags)
);

router.post(
  '/',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['discipline_monitor', 'administration', 'full']),
  asyncHandler(flagController.createFlag)
);

router.patch(
  '/:id/status',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['discipline_monitor', 'administration', 'full']),
  validateObjectId('id'),
  asyncHandler(flagController.updateStatus)
);

// Backward-compatible resolve route
router.put(
  '/:id/resolve',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['discipline_monitor', 'administration', 'full']),
  validateObjectId('id'),
  asyncHandler(flagController.updateStatus)
);

module.exports = router;
