const express = require('express');
const authenticate = require('../../middleware/authenticate');
const { validateBody } = require('../../utils/validation');
const controller = require('./auth.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
router.post('/login', loginLimiter, validateBody({ type: 'object', required: ['email', 'password'], additionalProperties: false, properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } } }), controller.login);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
module.exports = router;
