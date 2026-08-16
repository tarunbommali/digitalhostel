class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendSuccess = (res, data = {}, message = 'Operation completed successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendPaginated = (res, data = [], pagination = {}, message = 'Data retrieved successfully') => {
  const total = Number(pagination.total) || 0;
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 20;
  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  asyncHandler,
  sendSuccess,
  sendPaginated,
};
