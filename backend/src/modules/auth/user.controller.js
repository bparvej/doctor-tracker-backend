const userService = require('./user.service');
const { writeAudit } = require('../../utils/audit');

async function list(request, reply) {
  return reply.send({ success: true, data: await userService.list(request.query) });
}
async function get(request, reply) {
  const user = await userService.getById(request.params.id);
  return reply.send({ success: true, data: user.toSafeObject ? user.toSafeObject() : user });
}
async function create(request, reply) {
  const user = await userService.create(request.body);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'CREATE', entityType: 'USER', entityId: user.id, summary: `Created user ${user.email}`, changedFields: ['name', 'email', 'role', 'isActive'] });
  return reply.code(201).send({ success: true, data: user });
}
async function update(request, reply) {
  const before = await userService.getById(request.params.id);
  const beforeSafe = before.toSafeObject();
  const user = await userService.update(request.params.id, request.body, request.user.sub);
  const changedFields = Object.keys(request.body).filter((key) => key !== 'password' && beforeSafe[key] !== user[key]);
  if (request.body.password !== undefined) changedFields.push('password');
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'UPDATE', entityType: 'USER', entityId: user.id, summary: `Updated user ${user.email}`, changedFields });
  return reply.send({ success: true, data: user });
}
async function remove(request, reply) {
  const user = await userService.remove(request.params.id, request.user.sub);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'DELETE', entityType: 'USER', entityId: user.id, summary: `Deleted user ${user.email}`, changedFields: [] });
  return reply.send({ success: true, data: { deleted: true, id: user.id } });
}
module.exports = { list, get, create, update, remove };
