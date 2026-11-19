const service = require('./patient.service');
const { writeAudit } = require('../../utils/audit');

async function list(request, reply) { try { return reply.send({ success: true, data: await service.list(request.query) }); } catch (error) { throw error; } }
async function get(request, reply) { try { return reply.send({ success: true, data: await service.getById(request.params.id) }); } catch (error) { throw error; } }
async function create(request, reply) { try {
  const item = await service.create(request.body, request.user.sub);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'CREATE', entityType: 'PATIENT', entityId: item.id, summary: `Created patient ${item.name}`, changedFields: ['name', 'age', 'gender', 'phone', 'email', 'condition', 'doctorId'] });
  return reply.code(201).send({ success: true, data: item });
} catch (error) { throw error; } }
async function update(request, reply) { try {
  const before = await service.getById(request.params.id);
  const item = await service.update(request.params.id, request.body, request.user.sub);
  const changedFields = Object.keys(request.body).filter((key) => String(before[key] || '') !== String(item[key] || ''));
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'UPDATE', entityType: 'PATIENT', entityId: item.id, summary: `Updated patient ${item.name}`, changedFields });
  return reply.send({ success: true, data: item });
} catch (error) { throw error; } }
async function remove(request, reply) { try {
  const item = await service.remove(request.params.id);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'DELETE', entityType: 'PATIENT', entityId: request.params.id, summary: `Deleted patient ${item.name}`, changedFields: [] });
  return reply.send({ success: true, data: { deleted: true, id: request.params.id } });
} catch (error) { throw error; } }
module.exports = { list, get, create, update, remove };
