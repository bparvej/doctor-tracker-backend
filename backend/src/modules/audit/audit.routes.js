const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./audit.controller');

module.exports = async function auditRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', authorize('ADMIN'));
  fastify.get('/', controller.list);
  fastify.get('/:id', controller.get);
};
