const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

// 1. Public Directory Endpoints (Must be registered before /:slug parameter route)
router.get('/public/locations', asyncHandler(organizationController.getPublicLocations));
router.get('/public', asyncHandler(organizationController.getPublicOrganizations));

// 2. Public Tenant Slug Profile Resolution (Supports both /by-slug/:slug and /:slug)
router.get('/by-slug/:slug', asyncHandler(organizationController.getBySlug));
router.get('/:slug', asyncHandler(organizationController.getBySlug));

// 3. Admin / SuperAdmin Tenant Settings & Branding Updates
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
