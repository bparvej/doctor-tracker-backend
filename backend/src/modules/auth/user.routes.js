const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./user.controller');

const userCreateBody = {
  type: 'object', required: ['name', 'email', 'password', 'role'], additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    role: { type: 'string', enum: ['ADMIN', 'VIEWER'] },
    isActive: { type: 'boolean', default: true }
  }
};

const userUpdateBody = {
  type: 'object', additionalProperties: false, minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    role: { type: 'string', enum: ['ADMIN', 'VIEWER'] },
    isActive: { type: 'boolean' }
  }
};

module.exports = async function userRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', authorize('ADMIN'));
  fastify.get('/', controller.list);
  fastify.post('/', { schema: { body: userCreateBody } }, controller.create);
  fastify.get('/:id', controller.get);
  fastify.put('/:id', { schema: { body: userUpdateBody } }, controller.update);
  fastify.delete('/:id', controller.remove);
};
