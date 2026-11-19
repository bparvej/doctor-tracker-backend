const { appError } = require('./error-handler');

function authorize(...allowedRoles) {
  return async function (request) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      throw appError(403, 'Insufficient permissions', 'FORBIDDEN');
    }
  }
}
module.exports = authorize;
