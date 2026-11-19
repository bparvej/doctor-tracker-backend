const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./patient.controller');

const patientBody = {
  type: 'object', required: ['name', 'age', 'gender', 'phone', 'condition', 'doctorId'], additionalProperties: false,
  properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, age: { type: 'integer', minimum: 0, maximum: 150 }, gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' }, condition: { type: 'string', minLength: 1, maxLength: 150 }, doctorId: { type: 'string' } }
};

module.exports = async function patientRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);
  fastify.get('/', controller.list);
  fastify.post('/', { preHandler: authorize('ADMIN'), schema: { body: patientBody } }, controller.create);
  fastify.get('/:id', controller.get);
  fastify.put('/:id', { preHandler: authorize('ADMIN'), schema: { body: { ...patientBody, required: [], minProperties: 1 } } }, controller.update);
  fastify.delete('/:id', { preHandler: authorize('ADMIN') }, controller.remove);
};
