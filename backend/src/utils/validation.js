const { appError } = require('../middleware/error-handler');

function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    if (schema.required) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(body, key) || body[key] === undefined || body[key] === null || body[key] === '') {
          return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
        }
      }
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      if (Object.keys(body).some((key) => !allowed.has(key))) {
        return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      }
    }
    if (schema.minProperties && Object.keys(body).length < schema.minProperties) {
      return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
    }

    for (const [key, rule] of Object.entries(schema.properties || {})) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
      const value = body[key];
      if (rule.type === 'string' && typeof value !== 'string') return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.type === 'integer' && (!Number.isInteger(value))) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.type === 'boolean' && typeof value !== 'boolean') return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.minLength && value.length < rule.minLength) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.maxLength && value.length > rule.maxLength) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.minimum !== undefined && value < rule.minimum) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.maximum !== undefined && value > rule.maximum) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.enum && !rule.enum.includes(value)) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
      if (rule.format === 'email' && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return next(appError(400, 'Request validation failed', 'VALIDATION_ERROR'));
    }
    next();
  };
}

module.exports = { validateBody };
