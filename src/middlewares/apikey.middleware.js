require('dotenv').config();

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key é obrigatória.' });
  }

  if (apiKey !== process.env.EXTERNAL_API_KEY) {
    return res.status(403).json({ message: 'API Key inválida.' });
  }

  next();
};

module.exports = { validateApiKey };
