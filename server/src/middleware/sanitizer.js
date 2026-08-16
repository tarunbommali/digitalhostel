const mongoose = require('mongoose');
const { BadRequestError } = require('../utils/responseHelper');

/**
 * Recursively cleans object keys to prevent NoSQL operator injection and prototype pollution
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip prototype pollution vectors and NoSQL operators ($gt, $ne, dotted paths)
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanObject(req.params);
  }
  next();
};

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.isValidObjectId(id)) {
      return next(new BadRequestError(`Invalid identifier format for '${paramName}': ${id}`));
    }
    next();
  };
};

module.exports = {
  sanitizeInput,
  validateObjectId,
};
