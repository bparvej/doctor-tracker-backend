const mongoose = require('mongoose');
const Doctor = require('./doctor.model');
const Patient = require('../patients/patient.model');
const { appError } = require('../../middleware/error-handler');
const { parsePagination, escapeRegex } = require('../../utils/pagination');

async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.search) filter.$text = { $search: String(query.search).trim() };
  if (query.specialization) filter.specialization = escapeRegex(query.specialization);
  if (query.hospital) filter.hospital = escapeRegex(query.hospital);
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  const allowedSort = new Set(['createdAt', 'name', 'specialization', 'hospital']);
  const sortBy = allowedSort.has(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([Doctor.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(), Doctor.countDocuments(filter)]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw appError(400, 'Invalid doctor identifier', 'INVALID_OBJECT_ID');
  const item = await Doctor.findById(id).lean();
  if (!item) throw appError(404, 'Doctor not found', 'NOT_FOUND');
  return item;
}
async function create(body, actorId) {
  return Doctor.create({ ...body, createdBy: actorId, updatedBy: actorId });
}
async function update(id, body, actorId) {
  await getById(id);
  return Doctor.findByIdAndUpdate(id, { ...body, updatedBy: actorId }, { new: true, runValidators: true });
}
async function remove(id) {
  await getById(id);
  const patientCount = await Patient.countDocuments({ doctorId: id });
  if (patientCount > 0) throw appError(409, 'Cannot delete doctor with associated patients', 'DOCTOR_HAS_PATIENTS', { patientCount });
  return Doctor.findByIdAndDelete(id);
}
async function listPatients(id, query) {
  await getById(id);
  const { page, limit, skip } = parsePagination(query);
  const filter = { doctorId: id };
  if (query.search) filter.$text = { $search: String(query.search).trim() };
  if (query.condition) filter.condition = escapeRegex(query.condition);
  const [items, total] = await Promise.all([Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Patient.countDocuments(filter)]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
module.exports = { list, getById, create, update, remove, listPatients };
