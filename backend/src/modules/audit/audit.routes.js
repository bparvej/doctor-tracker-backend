const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./audit.controller');
const router = express.Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', controller.list);
router.get('/:id', controller.get);

module.exports = router;
