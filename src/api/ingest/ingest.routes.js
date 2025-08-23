const express = require('express');
const router = express.Router();
const controller = require('./ingest.controller');
const { validateApiKey } = require('../../middlewares/apikey.middleware');

/**
 * @route   POST /api/ingest/lead
 * @desc    Ingere um lead externo no bolsão de leads
 * @access  Público (com API Key)
 */
router.post('/lead', validateApiKey, controller.ingestLead);

module.exports = router;
