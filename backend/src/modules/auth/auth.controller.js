const authService = require('./auth.service');
const { appError } = require('../../middleware/error-handler');
const { writeAudit } = require('../../utils/audit');

async function login(request, reply) {
  try {
    const user = await authService.login(request.body.email, request.body.password);
    const payload = { sub: user.id, role: user.role };
    const token = await reply.jwtSign(payload);
    await writeAudit({ request, actor: user, action: 'LOGIN', entityType: 'USER', entityId: user.id, summary: `User ${user.email} logged in`, changedFields: [] });
    return reply.code(200).send({ success: true, data: { token, user: user.toSafeObject() } });
  } catch (error) {
    if (error.statusCode === 401) {
      await writeAudit({ request, actor: null, action: 'LOGIN_FAILED', entityType: 'USER', summary: 'Failed login attempt', changedFields: [], metadata: { email: request.body.email } });
    }
    throw error;
  }
}
async function me(request, reply) {
  try {
    const user = await authService.findById(request.user.sub);
    if (!user || !user.isActive) throw appError(401, 'User is inactive or unavailable', 'UNAUTHORIZED');
    return reply.code(200).send({ success: true, data: user.toSafeObject() });
  } catch (error) { throw error; }
}
async function logout(request, reply) {
  try {
    await writeAudit({ request, actor: { id: request.user.sub, name: null }, action: 'LOGOUT', entityType: 'USER', entityId: request.user.sub, summary: 'User logged out', changedFields: [] });
    return reply.code(200).send({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) { throw error; }
}
module.exports = { login, me, logout };
