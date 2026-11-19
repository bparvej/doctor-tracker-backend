const { appError } = require('./error-handler');
const User = require('../modules/auth/user.model');

async function authenticate(request) {
  try { await request.jwtVerify(); }
  catch (error) {
    throw appError(401, 'Authentication required', 'UNAUTHORIZED');
  }
  const user = await User.findById(request.user.sub).select('_id role isActive');
  if (!user || !user.isActive) {
    throw appError(401, 'User is inactive or unavailable', 'UNAUTHORIZED');
  }
  if (request.user.role !== user.role) {
    throw appError(401, 'Authentication context is invalid', 'UNAUTHORIZED');
  }
}
module.exports = authenticate;
