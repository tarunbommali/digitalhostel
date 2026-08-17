const Organization = require('../models/Organization');
const { ForbiddenError } = require('../utils/responseHelper');
const {
  isFeatureEnabled,
  getMinimumPlanForFeature,
  getPlanLimit,
  normalizePlan,
} = require('../config/plans');

/**
 * Middleware that gates an endpoint to organizations having a specific plan feature.
 * @param {string} featureKey - Key in PLAN_FEATURES (e.g. 'monthlyBilling', 'bulkImport')
 */
const requirePlanFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      // Super Admin platform-level bypass
      if (req.user && req.user.role === 'super_admin') {
        return next();
      }

      const orgId = req.organizationId || (req.user && req.user.organizationId);
      if (!orgId) {
        return next(new ForbiddenError('No organization context found for plan feature check'));
      }

      const organization = await Organization.findById(orgId).select('plan subscriptionStatus isActive');
      if (!organization) {
        return next(new ForbiddenError('Target tenant organization not found'));
      }

      const currentPlan = organization.plan || 'BASIC';
      const allowed = isFeatureEnabled(currentPlan, featureKey);

      if (!allowed) {
        const requiredPlan = getMinimumPlanForFeature(featureKey);
        return res.status(403).json({
          success: false,
          code: 'PLAN_FEATURE_LOCKED',
          message: `The '${featureKey}' capability is locked. It requires an upgrade to the ${requiredPlan} tier.`,
          feature: featureKey,
          currentPlan: normalizePlan(currentPlan),
          requiredPlan,
        });
      }

      req.organization = organization;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Utility to verify quota limit against an organization's plan.
 * @param {string} organizationId
 * @param {'maxStudents'|'maxModerators'|'maxBlocks'} limitKey
 * @param {number} currentCount
 */
const assertPlanQuota = async (organizationId, limitKey, currentCount) => {
  const organization = await Organization.findById(organizationId).select('plan settings');
  if (!organization) {
    throw new ForbiddenError('Tenant organization not found');
  }

  const currentPlan = organization.plan || 'BASIC';
  const planLimit = getPlanLimit(currentPlan, limitKey);

  // If organization has custom settings override, use the higher value if explicitly configured
  const settingOverride = organization.settings?.[limitKey];
  const effectiveLimit = typeof settingOverride === 'number' ? Math.max(settingOverride, planLimit) : planLimit;

  if (currentCount >= effectiveLimit) {
    const error = new ForbiddenError(
      `Plan quota limit exceeded for ${limitKey}. Current plan (${currentPlan}) allows up to ${effectiveLimit}. Currently active: ${currentCount}. Please upgrade to a higher tier.`
    );
    error.code = 'PLAN_QUOTA_EXCEEDED';
    error.limitKey = limitKey;
    error.limit = effectiveLimit;
    error.currentCount = currentCount;
    throw error;
  }
};

module.exports = {
  requirePlanFeature,
  assertPlanQuota,
};
