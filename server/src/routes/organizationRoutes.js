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

// 2. Tenant Slug / ID Profile Resolution
router.get('/by-id/:id', authMiddleware, validateObjectId('id'), asyncHandler(organizationController.getOrganizationById));
router.get('/by-slug/:slug', asyncHandler(organizationController.getBySlug));
router.get('/:slug', asyncHandler(organizationController.getBySlug));

// 3. Admin / SuperAdmin Tenant Settings & Updates (Supports PATCH and PUT)
router.route('/:id')
  .get(authMiddleware, validateObjectId('id'), asyncHandler(organizationController.getOrganizationById))
  .patch(
    authMiddleware,
    requireRole(['super_admin', 'admin']),
    validateObjectId('id'),
    asyncHandler(organizationController.updateOrganization)
  )
  .put(
    authMiddleware,
    requireRole(['super_admin', 'admin']),
    validateObjectId('id'),
    asyncHandler(organizationController.updateOrganization)
  );

const { requirePlanFeature } = require('../middleware/planGuard');

router.patch(
  '/:id/branding',
  authMiddleware,
  requireRole(['super_admin', 'admin']),
  validateObjectId('id'),
  requirePlanFeature('customBranding'),
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
