const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { validateBody } = require('../../utils/validation');
const controller = require('./user.controller');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/', controller.list);
router.post('/', validateBody({ type: 'object', required: ['name', 'email', 'password', 'role'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 128 }, role: { type: 'string', enum: ['ADMIN', 'VIEWER'] }, isActive: { type: 'boolean' } } }), controller.create);
router.get('/:id', controller.get);
router.put('/:id', validateBody({ type: 'object', additionalProperties: false, minProperties: 1, properties: { name: { type: 'string', minLength: 1, maxLength: 100 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 128 }, role: { type: 'string', enum: ['ADMIN', 'VIEWER'] }, isActive: { type: 'boolean' } } }), controller.update);
router.delete('/:id', controller.remove);
module.exports = router;
