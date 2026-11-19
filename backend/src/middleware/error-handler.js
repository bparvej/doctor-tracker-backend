const mongoose = require('mongoose');

function appError(statusCode, message, code = 'APP_ERROR', details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  return error;
}

function errorHandler(error, request, reply) {
  request.log.error({ err: error, requestId: request.id }, 'Request failed');
  let statusCode = error.statusCode || error.statusCode === 0 ? error.statusCode : 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (error.validation) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
  } else if (error.name === 'JsonWebTokenError' || error.code === 'FST_JWT_BAD_REQUEST') {
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

  return reply.code(statusCode).send({
    success: false,
    error: { code, message, ...(error.details ? { details: error.details } : {}) },
    requestId: request.id
  });
}
module.exports = { appError, errorHandler };
