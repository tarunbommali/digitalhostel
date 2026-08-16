const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

// 1. Static Routes
router.post('/request', asyncHandler(leaveController.submitLeave));
router.post(
  '/decide',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'discipline_monitor', 'full']),
  asyncHandler(leaveController.updateStatus)
);

// 2. Main Collection Routes
router.get('/', asyncHandler(leaveController.listLeaves));
router.post('/', asyncHandler(leaveController.submitLeave));

// 3. Parameterized Routes (/:id)
router.get('/:id', validateObjectId('id'), asyncHandler(leaveController.getLeaveById));

router.patch(
  '/:id/status',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'discipline_monitor', 'full']),
  validateObjectId('id'),
  asyncHandler(leaveController.updateStatus)
);

router.put(
  '/:id/status',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'discipline_monitor', 'full']),
  validateObjectId('id'),
  asyncHandler(leaveController.updateStatus)
);

module.exports = router;
