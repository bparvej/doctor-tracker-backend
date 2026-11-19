const { appError } = require('./error-handler');

function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(appError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }
    next();
  };
}
module.exports = authorize;
