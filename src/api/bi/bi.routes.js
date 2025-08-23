const express = require('express');
const router = express.Router();
const controller = require('./bi.controller');

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
router.get('/conversion-series', controller.getConversionSeries);

module.exports = router;
