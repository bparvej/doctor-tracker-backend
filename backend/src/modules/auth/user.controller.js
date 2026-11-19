const userService = require('./user.service');
const { writeAudit } = require('../../utils/audit');

async function list(req, res, next) {
  try {
    return res.status(200).json({ success: true, data: await userService.list(req.query) });
  } catch (error) {
    next(error);
  }
}
async function get(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    return res.status(200).json({ success: true, data: user.toSafeObject ? user.toSafeObject() : user });
  } catch (error) {
    next(error);
  }
}
async function create(req, res, next) {
  try {
    const user = await userService.create(req.body);
    await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'CREATE', entityType: 'USER', entityId: user.id, summary: `Created user ${user.email}`, changedFields: ['name', 'email', 'role', 'isActive'] });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
async function update(req, res, next) {
  try {
    const before = await userService.getById(req.params.id);
    const beforeSafe = before.toSafeObject();
    const user = await userService.update(req.params.id, req.body, req.user.sub);
    const changedFields = Object.keys(req.body).filter((key) => key !== 'password' && beforeSafe[key] !== user[key]);
    if (req.body.password !== undefined) changedFields.push('password');
    await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'UPDATE', entityType: 'USER', entityId: user.id, summary: `Updated user ${user.email}`, changedFields });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
async function remove(req, res, next) {
  try {
    const user = await userService.remove(req.params.id, req.user.sub);
    await writeAudit({ request: req, actor: { id: req.user.sub }, action: 'DELETE', entityType: 'USER', entityId: user.id, summary: `Deleted user ${user.email}`, changedFields: [] });
    return res.status(200).json({ success: true, data: { deleted: true, id: user.id } });
  } catch (error) {
    next(error);
  }
}
module.exports = { list, get, create, update, remove };
