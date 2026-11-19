const service = require('./doctor.service');
const patientService = require('../patients/patient.service');
const { writeAudit } = require('../../utils/audit');

async function list(req, res, next) { try { return res.status(200).json({ success: true, data: await service.list(req.query) }); } catch (error) { next(error); } }
async function get(req, res, next) { try { return res.status(200).json({ success: true, data: await service.getById(req.params.id) }); } catch (error) { next(error); } }
async function create(req, res, next) { try {
  const item = await service.create(req.body, req.user.sub);
  await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'CREATE', entityType: 'DOCTOR', entityId: item.id, summary: `Created doctor ${item.name}`, changedFields: ['name', 'specialization', 'hospital', 'phone', 'email'] });
  return res.status(201).json({ success: true, data: item });
} catch (error) { next(error); } }
async function update(req, res, next) { try {
  const before = await service.getById(req.params.id);
  const item = await service.update(req.params.id, req.body, req.user.sub);
  const changedFields = Object.keys(req.body).filter((key) => before[key] !== item[key]);
  await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'UPDATE', entityType: 'DOCTOR', entityId: item.id, summary: `Updated doctor ${item.name}`, changedFields });
  return res.status(200).json({ success: true, data: item });
} catch (error) { next(error); } }
async function remove(req, res, next) { try {
  const item = await service.remove(req.params.id);
  await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'DELETE', entityType: 'DOCTOR', entityId: req.params.id, summary: `Deleted doctor ${item.name}`, changedFields: [] });
  return res.status(200).json({ success: true, data: { deleted: true, id: req.params.id } });
} catch (error) { next(error); } }
async function listPatients(req, res, next) { try { return res.status(200).json({ success: true, data: await service.listPatients(req.params.id, req.query) }); } catch (error) { next(error); } }
async function createPatient(req, res, next) { try {
  const patient = await patientService.create({ ...req.body, doctorId: req.params.id }, req.user.sub);
  await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'CREATE', entityType: 'PATIENT', entityId: patient.id, summary: `Created patient ${patient.name}`, changedFields: ['name', 'age', 'gender', 'phone', 'email', 'condition', 'doctorId'] });
  return res.status(201).json({ success: true, data: patient });
} catch (error) { next(error); } }
module.exports = { list, get, create, update, remove, listPatients, createPatient };
