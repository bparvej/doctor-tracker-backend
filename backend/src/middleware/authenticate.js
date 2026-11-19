const { appError } = require('./error-handler');
const User = require('../modules/auth/user.model');
const { verifyToken } = require('../plugins/jwt');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) throw appError(401, 'Authentication required', 'UNAUTHORIZED');
    const token = authorization.slice(7).trim();
    if (!token) throw appError(401, 'Authentication required', 'UNAUTHORIZED');

    let payload;
    try { payload = verifyToken(token, req.app.config.JWT_SECRET); }
    catch (error) {
      if (error.name === 'TokenExpiredError') throw appError(401, 'Authentication token has expired', 'TOKEN_EXPIRED');
      throw appError(401, 'Invalid authentication token', 'INVALID_TOKEN');
    }

    const user = await User.findById(payload.sub).select('_id role isActive');
    if (!user || !user.isActive) throw appError(401, 'User is inactive or unavailable', 'UNAUTHORIZED');
    if (payload.role !== user.role) throw appError(401, 'Authentication context is invalid', 'UNAUTHORIZED');
    req.user = { sub: payload.sub, role: payload.role };
    next();
  } catch (error) { next(error); }
}
module.exports = authenticate;
