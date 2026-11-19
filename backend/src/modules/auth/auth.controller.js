const authService = require('./auth.service');
const { appError } = require('../../middleware/error-handler');
const { writeAudit } = require('../../utils/audit');
const { signToken } = require('../../plugins/jwt');

async function login(req, res, next) {
  try {
    const user = await authService.login(req.body.email, req.body.password);
    const token = signToken({ sub: user.id, role: user.role }, req.app.config.JWT_SECRET, req.app.config.JWT_EXPIRES_IN);
    await writeAudit({ request: req, actor: user, action: 'LOGIN', entityType: 'USER', entityId: user.id, summary: `User ${user.email} logged in`, changedFields: [] });
    return res.status(200).json({ success: true, data: { token, user: user.toSafeObject() } });
  } catch (error) {
    if (error.statusCode === 401) await writeAudit({ request: req, actor: null, action: 'LOGIN_FAILED', entityType: 'USER', summary: 'Failed login attempt', changedFields: [], metadata: { email: req.body.email } });
    next(error);
  }
}
async function me(req, res, next) {
  try {
    const user = await authService.findById(req.user.sub);
    if (!user || !user.isActive) throw appError(401, 'User is inactive or unavailable', 'UNAUTHORIZED');
    return res.status(200).json({ success: true, data: user.toSafeObject() });
  } catch (error) { next(error); }
}
async function logout(req, res, next) {
  try {
    await writeAudit({ request: req, actor: { id: req.user.sub, name: null }, action: 'LOGOUT', entityType: 'USER', entityId: req.user.sub, summary: 'User logged out', changedFields: [] });
    return res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) { next(error); }
}
module.exports = { login, me, logout };
