const biService = require('./bi.service');

const getKpis = async (req, res) => {
  try {
    const { startDate, endDate, userId, userIds } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "startDate e endDate são obrigatórios." 
      });
    }

    const ids = userIds ? (Array.isArray(userIds) ? userIds : String(userIds).split(',')) : (userId ? [userId] : null);

    const kpis = await biService.calculateKpis(new Date(startDate), new Date(endDate), ids);
    res.status(200).json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFunnel = async (req, res) => {
  try {
    const { startDate, endDate, userId, userIds } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "startDate e endDate são obrigatórios." 
      });
    }

    const ids = userIds ? (Array.isArray(userIds) ? userIds : String(userIds).split(',')) : (userId ? [userId] : null);

    const funnel = await biService.calculateFunnel(new Date(startDate), new Date(endDate), ids);
    res.status(200).json(funnel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversionSeries = async (req, res) => {
  try {
    const { startDate, endDate, userId, userIds } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate e endDate são obrigatórios." });
    }
    const ids = userIds ? (Array.isArray(userIds) ? userIds : String(userIds).split(',')) : (userId ? [userId] : null);
    const series = await biService.calculateConversionSeries(new Date(startDate), new Date(endDate), ids);
    res.status(200).json(series);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getKpis,
  getFunnel,
  getConversionSeries,
};
