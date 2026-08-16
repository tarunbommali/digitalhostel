const { UnauthorizedError, ForbiddenError } = require('../utils/responseHelper');

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SuperAdmin has platform-wide bypass
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied: Requires role [${allowedRoles.join(', ')}]. Current role: [${req.user.role}]`
        )
      );
    }

    next();
  };
};

const requireModeratorCapability = (allowedCapabilities = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SuperAdmin and Admin have full capability bypass
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'moderator') {
      if (req.user.moderatorType === 'full') {
        return next();
      }
      if (allowedCapabilities.includes(req.user.moderatorType)) {
        return next();
      }
    }

    return next(
      new ForbiddenError(
        `Access denied: Required moderator capability [${allowedCapabilities.join(', ')}]. Current: [${req.user.moderatorType || 'none'}]`
      )
    );
  };
};

module.exports = {
  requireRole,
  requireModeratorCapability,
};
