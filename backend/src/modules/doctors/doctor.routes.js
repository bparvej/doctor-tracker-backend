const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { validateBody } = require('../../utils/validation');
const controller = require('./doctor.controller');

const router = express.Router();
router.use(authenticate);
const doctorBody = { type: 'object', required: ['name', 'specialization', 'hospital', 'phone', 'email'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, specialization: { type: 'string', minLength: 1, maxLength: 100 }, hospital: { type: 'string', minLength: 1, maxLength: 150 }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' } } };
router.get('/', controller.list);
router.post('/', authorize('ADMIN'), validateBody(doctorBody), controller.create);
router.get('/:id', controller.get);
router.put('/:id', authorize('ADMIN'), validateBody({ ...doctorBody, required: [], minProperties: 1 }), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);
router.get('/:id/patients', controller.listPatients);
router.post('/:id/patients', authorize('ADMIN'), validateBody({ type: 'object', required: ['name', 'age', 'gender', 'phone', 'condition'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, age: { type: 'integer', minimum: 0, maximum: 150 }, gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' }, condition: { type: 'string', minLength: 1, maxLength: 150 } } }), controller.createPatient);
module.exports = router;
