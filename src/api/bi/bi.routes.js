const express = require('express');
const router = express.Router();
const controller = require('./bi.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

router.use(authMiddleware);
router.use(requireRole('manager'));

/**
 * @route   GET /api/bi/kpis
 * @desc    Retorna KPIs calculados para o período especificado
 * @access  Privado (apenas gestores)
 */
router.get('/kpis', controller.getKpis);

/**
 * @route   GET /api/bi/funnel
 * @desc    Retorna dados do funil de vendas para o período especificado
 * @access  Privado (apenas gestores)
 */
router.get('/funnel', controller.getFunnel);

module.exports = router;
