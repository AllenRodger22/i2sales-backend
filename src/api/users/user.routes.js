const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.get('/corretores', userController.getCorretores);
router.get('/all', userController.getCorretores);
router.post('/create', userController.createUser);

module.exports = router;
