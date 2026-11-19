const mongoose = require('mongoose');
const User = require('./user.model');
const authService = require('./auth.service');
const { appError } = require('../../middleware/error-handler');

async function list(query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || '10', 10) || 10));
  const filter = {};
  if (query.search) {
    const value = String(query.search).trim().replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: value, $options: 'i' } }, { email: { $regex: value, $options: 'i' } }];
  }
  if (query.role) filter.role = String(query.role).toUpperCase();
  if (query.isActive !== undefined) filter.isActive = String(query.isActive) === 'true';

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  return { items: items.map((user) => user.toSafeObject()), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw appError(400, 'Invalid user identifier', 'INVALID_OBJECT_ID');
  const user = await User.findById(id);
  if (!user) throw appError(404, 'User not found', 'NOT_FOUND');
  return user;
}

async function create(body) {
  const passwordHash = await authService.hashPassword(body.password);
  const user = await User.create({ name: body.name, email: body.email, passwordHash, role: body.role, isActive: body.isActive !== false });
  return user.toSafeObject();
}

async function update(id, body, actorId) {
  const user = await getById(id);
  if (String(user._id) === String(actorId) && body.role && body.role !== user.role) {
    throw appError(409, 'You cannot change your own role', 'SELF_ROLE_CHANGE_FORBIDDEN');
  }
  if (String(user._id) === String(actorId) && body.isActive === false) {
    throw appError(409, 'You cannot deactivate your own account', 'SELF_DEACTIVATION_FORBIDDEN');
  }

  const changes = {};
  if (body.name !== undefined) changes.name = body.name;
  if (body.email !== undefined) changes.email = body.email;
  if (body.role !== undefined) changes.role = body.role;
  if (body.isActive !== undefined) changes.isActive = body.isActive;
  if (body.password !== undefined) changes.passwordHash = await authService.hashPassword(body.password);

  const updated = await User.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  return updated.toSafeObject();
}

async function remove(id, actorId) {
  if (String(id) === String(actorId)) throw appError(409, 'You cannot delete your own account', 'SELF_DELETE_FORBIDDEN');
  const user = await getById(id);
  await User.findByIdAndDelete(id);
  return user.toSafeObject();
}

module.exports = { list, getById, create, update, remove };
