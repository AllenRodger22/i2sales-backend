const biService = require('./bi.service');
const csvProcessor = require('../../services/csvProcessor');
const geminiService = require('../../services/geminiService');

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

const uploadCSV = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Nenhum arquivo foi enviado." });
    }
    
    const processedFiles = [];
    
    for (const file of req.files) {
      const fileInfo = csvProcessor.parseFilename(file.originalname);
      if (!fileInfo) {
        continue;
      }
      
      let data;
      if (fileInfo.type === 'produtividade') {
        data = await csvProcessor.processProdutividadeCSV(file.buffer);
      } else {
        data = await csvProcessor.processClientesCSV(file.buffer);
      }
      
      processedFiles.push({
        ...fileInfo,
        data,
        filename: file.originalname
      });
    }
    
    res.status(200).json({ 
      message: "Arquivos processados com sucesso!",
      files: processedFiles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalysis = async (req, res) => {
  try {
    const { mode } = req.params;
    const { data } = req.body;
    
    let result;
    switch (mode) {
      case 'individual':
        result = biService.calculateIndividualAnalysis(
          data.produtividade, 
          data.clientes
        );
        break;
      case 'individual-comparative':
        result = biService.calculateComparativeAnalysis(
          data.current, 
          data.previous
        );
        break;
      case 'team':
        result = {
          rankings: biService.calculateTeamRankings(data.agents),
          funnel: biService.calculateTeamFunnel(data.agents)
        };
        break;
      case 'team-comparative':
        result = {
          current: {
            rankings: biService.calculateTeamRankings(data.currentTeam),
            funnel: biService.calculateTeamFunnel(data.currentTeam)
          },
          previous: {
            rankings: biService.calculateTeamRankings(data.previousTeam),
            funnel: biService.calculateTeamFunnel(data.previousTeam)
          }
        };
        break;
      default:
        return res.status(400).json({ message: "Modo de análise inválido." });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAIInsights = async (req, res) => {
  try {
    const { data, mode } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        message: "Serviço de IA temporariamente indisponível. Configure GEMINI_API_KEY." 
      });
    }
    
    const insights = await geminiService.generateInsights(data, mode);
    res.status(200).json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCorretores = async (req, res) => {
  try {
    const { getDb } = require('../../config/database');
    const corretores = await getDb().collection('users').find({ 
      role: { $in: ['user', 'manager'] } 
    }).toArray();
    
    const corretoresFormatted = corretores.map(c => ({
      id: c._id,
      name: c.name,
      email: c.email,
      role: c.role
    }));
    
    res.status(200).json(corretoresFormatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCorretorAnalysis = async (req, res) => {
  try {
    const { corretorId } = req.params;
    const analysis = await biService.calculateCorretorAnalysis(corretorId);
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamAnalysis = async (req, res) => {
  try {
    const teamData = await biService.calculateTeamAnalysisFromDB();
    res.status(200).json(teamData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getKpis,
  getFunnel,
  getConversionSeries,
  uploadCSV,
  getAnalysis,
  getAIInsights,
  getCorretores,
  getCorretorAnalysis,
  getTeamAnalysis,
};
