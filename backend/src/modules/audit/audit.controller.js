const service = require('./audit.service');

async function list(request, reply) { try { return reply.send({ success: true, data: await service.list(request.query) }); } catch (error) { throw error; } }
async function get(request, reply) { try { return reply.send({ success: true, data: await service.getById(request.params.id) }); } catch (error) { throw error; } }
module.exports = { list, get };
