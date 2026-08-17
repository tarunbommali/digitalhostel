const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

const { requirePlanFeature } = require('../middleware/planGuard');

router.use(authMiddleware, tenantGuard);

// 1. Static Routes (Must precede /:id)
router.post(
  '/bulk-import',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  requirePlanFeature('bulkImport'),
  asyncHandler(studentController.bulkImport)
);
router.post(
  '/bulk',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  requirePlanFeature('bulkImport'),
  asyncHandler(studentController.bulkImport)
);

// 2. Directory Listing & Enrollment
router.get(
  '/',
  requireRole(['admin', 'moderator']),
  asyncHandler(studentController.listStudents)
);

router.post(
  '/',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(studentController.createStudent)
);

// 3. Parameterized Routes (/:id)
router.get(
  '/:id/overview',
  validateObjectId('id'),
  asyncHandler(studentController.getStudentOverview)
);

router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(studentController.getStudentById)
);

router.put(
  '/:id/renew-pass',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(studentController.renewPass)
);

router.post(
  '/:id/renew-pass',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(studentController.renewPass)
);

router.put(
  '/:id/status',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(studentController.updateStatus)
);

router.patch(
  '/:id/status',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(studentController.updateStatus)
);

router.put(
  '/:id',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(studentController.updateStudent)
);

module.exports = router;
