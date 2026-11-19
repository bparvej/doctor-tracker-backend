const mongoose = require('mongoose');
const AuditLog = require('./audit.model');
const { appError } = require('../../middleware/error-handler');
const { parsePagination } = require('../../utils/pagination');

async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.from || query.to) { filter.createdAt = {}; if (query.from) filter.createdAt.$gte = new Date(query.from); if (query.to) filter.createdAt.$lte = new Date(query.to); }
  if (query.actor) filter.actorId = query.actor;
  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.entityId) filter.entityId = String(query.entityId);
  const [items, total] = await Promise.all([AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), AuditLog.countDocuments(filter)]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw appError(400, 'Invalid audit log identifier', 'INVALID_OBJECT_ID');
  const item = await AuditLog.findById(id).lean();
  if (!item) throw appError(404, 'Audit log not found', 'NOT_FOUND');
  return item;
}
module.exports = { list, getById };
