const Doctor = require('./doctor.model');
const service = require('./doctor.service');
const patientService = require('../patients/patient.service');
const { writeAudit } = require('../../utils/audit');

async function list(request, reply) { try { return reply.send({ success: true, data: await service.list(request.query) }); } catch (error) { throw error; } }
async function get(request, reply) { try { return reply.send({ success: true, data: await service.getById(request.params.id) }); } catch (error) { throw error; } }
async function create(request, reply) { try {
  const item = await service.create(request.body, request.user.sub);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'CREATE', entityType: 'DOCTOR', entityId: item.id, summary: `Created doctor ${item.name}`, changedFields: ['name', 'specialization', 'hospital', 'phone', 'email'] });
  return reply.code(201).send({ success: true, data: item });
} catch (error) { throw error; } }
async function update(request, reply) { try {
  const before = await service.getById(request.params.id);
  const item = await service.update(request.params.id, request.body, request.user.sub);
  const changedFields = Object.keys(request.body).filter((key) => before[key] !== item[key]);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'UPDATE', entityType: 'DOCTOR', entityId: item.id, summary: `Updated doctor ${item.name}`, changedFields });
  return reply.send({ success: true, data: item });
} catch (error) { throw error; } }
async function remove(request, reply) { try {
  const item = await service.remove(request.params.id);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'DELETE', entityType: 'DOCTOR', entityId: request.params.id, summary: `Deleted doctor ${item.name}`, changedFields: [] });
  return reply.send({ success: true, data: { deleted: true, id: request.params.id } });
} catch (error) { throw error; } }
async function listPatients(request, reply) { try { return reply.send({ success: true, data: await service.listPatients(request.params.id, request.query) }); } catch (error) { throw error; } }
async function createPatient(request, reply) { try {
  const patient = await patientService.create({ ...request.body, doctorId: request.params.id }, request.user.sub);
  await writeAudit({ request, actor: { id: request.user.sub }, action: 'CREATE', entityType: 'PATIENT', entityId: patient.id, summary: `Created patient ${patient.name}`, changedFields: ['name', 'age', 'gender', 'phone', 'email', 'condition', 'doctorId'] });
  return reply.code(201).send({ success: true, data: patient });
} catch (error) { throw error; } }
module.exports = { list, get, create, update, remove, listPatients, createPatient };
