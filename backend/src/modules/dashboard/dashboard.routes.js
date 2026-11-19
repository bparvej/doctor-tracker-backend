const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const controller = require('./dashboard.controller');
const router = express.Router();

router.get('/stats', authenticate, authorize('ADMIN'), controller.stats);

module.exports = router;
