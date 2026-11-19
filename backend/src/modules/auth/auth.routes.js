const authenticate = require('../../middleware/authenticate');
const controller = require('./auth.controller');

module.exports = async function authRoutes(fastify) {
  fastify.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } }, schema: { body: { type: 'object', required: ['email', 'password'], additionalProperties: false, properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } } } } }, controller.login);
  fastify.post('/logout', { preHandler: authenticate }, controller.logout);
  fastify.get('/me', { preHandler: authenticate }, controller.me);
};
