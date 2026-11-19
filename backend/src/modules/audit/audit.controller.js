const service = require('./audit.service');

async function list(req, res, next) { try { return res.status(200).json({ success: true, data: await service.list(req.query) }); } catch (error) { next(error); } }
async function get(req, res, next) { try { return res.status(200).json({ success: true, data: await service.getById(req.params.id) }); } catch (error) { next(error); } }
module.exports = { list, get };
