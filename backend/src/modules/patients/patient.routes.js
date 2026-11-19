const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { validateBody } = require('../../utils/validation');
const controller = require('./patient.controller');

const router = express.Router();
router.use(authenticate);
const patientBody = {
  type: 'object', required: ['name', 'age', 'gender', 'phone', 'condition', 'doctorId'], additionalProperties: false,
  properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, age: { type: 'integer', minimum: 0, maximum: 150 }, gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }, phone: { type: 'string', minLength: 1, maxLength: 30 }, email: { type: 'string', format: 'email' }, condition: { type: 'string', minLength: 1, maxLength: 150 }, doctorId: { type: 'string' } }
};
router.get('/', controller.list);
router.post('/', authorize('ADMIN'), validateBody(patientBody), controller.create);
router.get('/:id', controller.get);
router.put('/:id', authorize('ADMIN'), validateBody({ ...patientBody, required: [], minProperties: 1 }), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);
module.exports = router;
