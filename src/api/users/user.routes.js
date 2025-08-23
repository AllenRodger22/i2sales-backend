const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

router.use(authMiddleware);

router.get('/corretores', requireRole(['manager', 'admin']), userController.getCorretores);
router.get('/all', requireRole(['manager', 'admin']), userController.getCorretores);


module.exports = router;
