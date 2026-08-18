const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');
const { requirePlanFeature } = require('../middleware/planGuard');

// 1. Public Directory Endpoints (Must be registered before parameterized routes)
router.get('/public/locations', asyncHandler(organizationController.getPublicLocations));
router.get('/public', asyncHandler(organizationController.getPublicOrganizations));

// 2. Explicit Tenant Slug / ID Profile Resolution
router.get('/by-id/:id', authMiddleware, validateObjectId('id'), asyncHandler(organizationController.getOrganizationById));
router.get('/by-slug/:slug', asyncHandler(organizationController.getBySlug));

// 3. Sub-resource Settings Updates
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

router.patch(
  '/:id/features',
  authMiddleware,
  requireRole(['super_admin', 'admin']),
  validateObjectId('id'),
  asyncHandler(organizationController.updateOrganization)
);

// 4. Parameterized Routes (Handle both 24-char ObjectId and Slug gracefully, with PATCH/PUT/GET support)
router.route('/:id')
  .get(asyncHandler(async (req, res, next) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      return organizationController.getOrganizationById(req, res, next);
    }
    return organizationController.getBySlug(req, res, next);
  }))
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

module.exports = router;
