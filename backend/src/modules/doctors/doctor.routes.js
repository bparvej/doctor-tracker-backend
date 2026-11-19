const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./doctor.controller');

module.exports = async function doctorRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);
  fastify.get('/', controller.list);
  fastify.post('/', { preHandler: authorize('ADMIN'), schema: { body: { type: 'object', required: ['name', 'specialization', 'hospital', 'phone', 'email'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, specialization: { type: 'string', minLength: 1, maxLength: 100 }, hospital: { type: 'string', minLength: 1, maxLength: 150 }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' } } } } }, controller.create);
  fastify.get('/:id', controller.get);
  fastify.put('/:id', { preHandler: authorize('ADMIN'), schema: { body: { type: 'object', additionalProperties: false, minProperties: 1, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, specialization: { type: 'string', minLength: 1, maxLength: 100 }, hospital: { type: 'string', minLength: 1, maxLength: 150 }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' } } } } }, controller.update);
  fastify.delete('/:id', { preHandler: authorize('ADMIN') }, controller.remove);
  fastify.get('/:id/patients', controller.listPatients);
  fastify.post('/:id/patients', { preHandler: authorize('ADMIN'), schema: { body: { type: 'object', required: ['name', 'age', 'gender', 'phone', 'condition'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, age: { type: 'integer', minimum: 0, maximum: 150 }, gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' }, condition: { type: 'string', minLength: 1, maxLength: 150 } } } } }, controller.createPatient);
};
