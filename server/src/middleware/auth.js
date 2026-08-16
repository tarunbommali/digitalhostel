const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedError('No authorization token provided');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      throw new UnauthorizedError('Malformed authorization token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret_dev_key');
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      throw new UnauthorizedError('Invalid token claims');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new UnauthorizedError('User session not found');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is disabled. Contact system administrator.');
    }

    // 1. Invalidate JWT if tokenVersion doesn't match
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (decoded.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedError('Password was recently changed. Please login again with your new credentials.');
      }
    }

    // 2. Invalidate JWT if issued before/at passwordChangedAt timestamp
    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat <= changedTimestamp) {
        throw new UnauthorizedError('Password was recently changed. Please login again with your new credentials.');
      }
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid authorization token'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Authorization token has expired. Please re-login.'));
    }
    next(err);
  }
};

module.exports = {
  authMiddleware,
  protect: authMiddleware,
};
