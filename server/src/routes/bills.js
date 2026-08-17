const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

const { requirePlanFeature } = require('../middleware/planGuard');

router.use(authMiddleware, tenantGuard, requirePlanFeature('monthlyBilling'));

// 1. Static Routes
router.post(
  '/generate',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(billController.generateBills)
);

router.post(
  '/publish',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(billController.generateBills)
);

router.post(
  '/bulk-publish',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(billController.generateBills)
);

router.put(
  '/verify-period',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(billController.verifyPeriod)
);

router.put(
  '/update-batch',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(billController.updateBatch)
);

router.get(
  '/student/:studentId',
  validateObjectId('studentId'),
  asyncHandler(billController.getStudentSummary)
);

// 2. Collection & Parameterized Routes
router.get('/', asyncHandler(billController.listBills));
router.get('/:id', validateObjectId('id'), asyncHandler(billController.getBillById));

module.exports = router;
