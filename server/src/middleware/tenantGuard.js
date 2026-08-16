const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const { ForbiddenError, NotFoundError } = require('../utils/responseHelper');

/**
 * Ensures req.organizationId is strictly bound to authenticated tenant context
 * SuperAdmin may optionally target a specific tenant via x-tenant-id header
 */
const tenantGuard = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    if (req.user.role === 'super_admin') {
      const explicitOrgId = req.headers['x-tenant-id'] || req.query.tenantId;
      if (explicitOrgId) {
        if (!mongoose.isValidObjectId(explicitOrgId)) {
          return next(new NotFoundError('Invalid tenant identifier'));
        }
        const org = await Organization.findById(explicitOrgId);
        if (!org) {
          return next(new NotFoundError('Target tenant organization not found'));
        }
        req.organizationId = org._id;
      }
      return next();
    }

    if (!req.user.organizationId) {
      return next(new ForbiddenError('User has no assigned organization context'));
    }

    req.organizationId = req.user.organizationId;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  tenantGuard,
};
