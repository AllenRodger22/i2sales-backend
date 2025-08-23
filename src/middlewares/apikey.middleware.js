require('dotenv').config();

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.EXTERNAL_API_KEY;
  
  if (!expectedApiKey) {
    console.warn('EXTERNAL_API_KEY não configurada - endpoint de ingestão temporariamente desabilitado');
    return res.status(503).json({ 
      message: 'Endpoint de ingestão temporariamente indisponível. Configure EXTERNAL_API_KEY para ativar.' 
    });
  }
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key é obrigatória.' });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(403).json({ message: 'API Key inválida.' });
  }

  next();
};

module.exports = { validateApiKey };
