const mongoose = require('mongoose');

function appError(statusCode, message, code = 'APP_ERROR', details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  return error;
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode !== undefined ? error.statusCode : 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (error.type === 'entity.parse.failed') {
    statusCode = 400; code = 'VALIDATION_ERROR'; message = 'Request validation failed';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401; code = 'INVALID_TOKEN'; message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401; code = 'TOKEN_EXPIRED'; message = 'Authentication token has expired';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400; code = 'INVALID_OBJECT_ID'; message = 'Invalid resource identifier';
  } else if (error.code === 11000) {
    statusCode = 409; code = 'DUPLICATE_KEY'; message = 'A record with the supplied unique value already exists';
  } else if (statusCode >= 400 && statusCode < 500 && error.message) {
    message = error.message;
  }

  if (statusCode >= 500) console.error(error);
  const requestId = req.headers['x-request-id'] || req.id || null;
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(error.details ? { details: error.details } : {}) },
    ...(requestId ? { requestId } : {})
  });
}
module.exports = { appError, errorHandler };
