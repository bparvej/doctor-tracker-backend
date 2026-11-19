const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./dashboard.controller');

module.exports = async function dashboardRoutes(fastify) {
  fastify.get('/stats', { preHandler: [authenticate, authorize('ADMIN')] }, controller.stats);
};
