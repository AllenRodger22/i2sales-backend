const express = require('express');
const router = express.Router();
const controller = require('./bi.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

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

/**
 * @route   POST /api/bi/upload-csv
 * @desc    Upload e processa arquivos CSV de produtividade e clientes
 * @access  Privado (apenas gestores)
 */
router.post('/upload-csv', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  upload.array('files'), 
  controller.uploadCSV
);

/**
 * @route   POST /api/bi/analysis/:mode
 * @desc    Retorna análise específica baseada no modo (individual, team, etc.)
 * @access  Privado (apenas gestores)
 */
router.post('/analysis/:mode', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  controller.getAnalysis
);

/**
 * @route   POST /api/bi/ai-insights
 * @desc    Gera insights de IA usando Google Gemini
 * @access  Privado (apenas gestores)
 */
router.post('/ai-insights', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  controller.getAIInsights
);

router.get('/corretores', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  controller.getCorretores
);

router.get('/corretor/:corretorId', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  controller.getCorretorAnalysis
);

router.get('/team-analysis', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  controller.getTeamAnalysis
);

module.exports = router;
