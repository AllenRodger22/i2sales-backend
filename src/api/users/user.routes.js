const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

router.use(authMiddleware);

/**
 * @route   GET /api/users/corretores
 * @desc    Retorna todos os corretores (para seleção na distribuição de leads)
 * @access  Privado (apenas gestores)
 */
router.get('/corretores', requireRole('gestor'), async (req, res) => {
  try {
    const corretores = await userService.findAllCorretores();
    res.status(200).json(corretores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
