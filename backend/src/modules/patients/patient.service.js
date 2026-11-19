const mongoose = require('mongoose');
const Patient = require('./patient.model');
const Doctor = require('../doctors/doctor.model');
const { appError } = require('../../middleware/error-handler');
const { parsePagination, escapeRegex } = require('../../utils/pagination');

async function requireDoctor(id) {
  if (!mongoose.isValidObjectId(id)) throw appError(400, 'Invalid doctor identifier', 'INVALID_OBJECT_ID');
  if (!await Doctor.exists({ _id: id })) throw appError(400, 'doctorId references an unknown doctor', 'INVALID_DOCTOR');
}
async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.search) filter.$text = { $search: String(query.search).trim() };
  if (query.condition) filter.condition = escapeRegex(query.condition);
  if (query.doctorId) {
    if (!mongoose.isValidObjectId(query.doctorId)) throw appError(400, 'Invalid doctor identifier', 'INVALID_OBJECT_ID');
    filter.doctorId = query.doctorId;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  const allowedSort = new Set(['createdAt', 'name', 'age', 'condition']);
  const sortBy = allowedSort.has(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([Patient.find(filter).populate('doctorId', 'name specialization hospital').sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(), Patient.countDocuments(filter)]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw appError(400, 'Invalid patient identifier', 'INVALID_OBJECT_ID');
  const item = await Patient.findById(id).populate('doctorId', 'name specialization hospital').lean();
  if (!item) throw appError(404, 'Patient not found', 'NOT_FOUND');
  return item;
}
async function create(body, actorId) {
  await requireDoctor(body.doctorId);
  return Patient.create({ ...body, createdBy: actorId, updatedBy: actorId });
}
async function update(id, body, actorId) {
  await getById(id);
  if (body.doctorId) await requireDoctor(body.doctorId);
  return Patient.findByIdAndUpdate(id, { ...body, updatedBy: actorId }, { new: true, runValidators: true }).populate('doctorId', 'name specialization hospital');
}
async function remove(id) {
  await getById(id);
  return Patient.findByIdAndDelete(id);
}
module.exports = { list, getById, create, update, remove, requireDoctor };
