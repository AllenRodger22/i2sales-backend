const express = require('express');
const router = express.Router();
const controller = require('./corretor.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', controller.listCorretores);

module.exports = router;
