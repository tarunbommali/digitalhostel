const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

// 1. Static Routes
router.get(
  '/summary',
  requireRole(['admin', 'moderator']),
  asyncHandler(paymentController.getSummary)
);

router.post(
  '/record',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(paymentController.recordPayment)
);

router.post(
  '/verify',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(paymentController.verifyPayment)
);

// 2. Collection & Parameterized Routes
router.get('/', asyncHandler(paymentController.listPayments));
router.get('/:id', validateObjectId('id'), asyncHandler(paymentController.getPaymentById));

module.exports = router;
