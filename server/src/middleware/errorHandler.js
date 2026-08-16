const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} = require('../utils/responseHelper');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error = new BadRequestError(`Invalid format for resource identifier '${err.value}'`);
  }

  // 2. Mongoose Duplicate Key Conflict (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    error = new ConflictError(
      `Duplicate entry: ${field} '${value}' is already in use within this organization.`
    );
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    error = new BadRequestError(`Validation failed: ${details.join(', ')}`);
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid authorization token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Authorization token has expired. Please re-login.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code =
    error.code ||
    (statusCode === 400
      ? 'BAD_REQUEST'
      : statusCode === 401
      ? 'UNAUTHORIZED'
      : statusCode === 403
      ? 'FORBIDDEN'
      : statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 409
      ? 'CONFLICT'
      : 'INTERNAL_ERROR');

  // Log unexpected internal errors for observability
  if (statusCode >= 500) {
    console.error('[UNHANDLED_EXCEPTION]', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      organizationId: req.organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: error.details || null,
    },
  });
};

module.exports = errorHandler;
