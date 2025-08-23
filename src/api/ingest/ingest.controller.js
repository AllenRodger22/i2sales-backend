const ingestService = require('./ingest.service');

const ingestLead = async (req, res) => {
  try {
    const { name, email, phone, origin, source } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ 
        message: "Nome, email e telefone são obrigatórios." 
      });
    }

    const leadId = await ingestService.createExternalLead({
      name,
      email,
      phone,
      origin: origin || 'Tráfego Pago',
      source: source || 'External API'
    });

    res.status(201).json({ 
      id: leadId, 
      message: "Lead inserido no bolsão com sucesso!" 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao processar lead externo.", 
      error: error.message 
    });
  }
};

module.exports = {
  ingestLead,
};
