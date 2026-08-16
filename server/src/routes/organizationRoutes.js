const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

// Public tenant resolution
router.get('/:slug', asyncHandler(organizationController.getBySlug));

// Admin / SuperAdmin updates
router.patch(
  '/:id',
  authMiddleware,
  requireRole(['super_admin', 'admin']),
  validateObjectId('id'),
  asyncHandler(organizationController.updateOrganization)
);

router.patch(
  '/:id/branding',
  authMiddleware,
  requireRole(['super_admin', 'admin']),
  validateObjectId('id'),
  asyncHandler(organizationController.updateOrganization)
);

router.patch(
  '/:id/settings',
  authMiddleware,
  requireRole(['super_admin', 'admin']),
  validateObjectId('id'),
  asyncHandler(organizationController.updateOrganization)
);

module.exports = router;
