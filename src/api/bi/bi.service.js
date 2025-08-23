const { getDb } = require('../../config/database');

const calculateKpis = async (startDate, endDate, userIds = null) => {
  const collection = getDb().collection('clientes');

  const matchStage = {
    'timeline.date': {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (userIds && userIds.length) {
    const { ObjectId } = require('mongodb');
    matchStage.ownerId = { $in: userIds.map(id => new ObjectId(id)) };
  }

  const pipeline = [
    {
      $match: matchStage
    },
    {
      $unwind: '$timeline'
    },
    {
      $match: {
        'timeline.date': {
          $gte: startDate,
          $lte: endDate
        },
        'timeline.type': 'VendaGerada'
      }
    },
    {
      $group: {
        _id: null,
        totalVendas: { $sum: 1 },
        vgvTotal: { $sum: '$saleValue' },
        vendas: { $push: '$$ROOT' }
      }
    }
  ];

  const result = await collection.aggregate(pipeline).toArray();
  
  if (result.length === 0) {
    return {
      vgvTotal: 0,
      numeroLigacoes: 0,
      numeroDocumentos: 0,
      totalVendas: 0,
      ticketMedio: 0,
      tempoMedioFechamento: 0
    };
  }

  const data = result[0];
  const ticketMedio = data.totalVendas > 0 ? data.vgvTotal / data.totalVendas : 0;

  let tempoMedioFechamento = 0;
  if (data.vendas.length > 0) {
    const tempos = data.vendas.map(venda => {
      const primeiroEvento = venda.timeline.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      const eventoVenda = venda.timeline.find(e => e.type === 'VendaGerada');
      
      if (primeiroEvento && eventoVenda) {
        return new Date(eventoVenda.date) - new Date(primeiroEvento.date);
      }
      return 0;
    }).filter(tempo => tempo > 0);

    if (tempos.length > 0) {
      const tempoMedioMs = tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length;
      tempoMedioFechamento = Math.round(tempoMedioMs / (1000 * 60 * 60 * 24));
    }
  }

  const ligacoesPipeline = [
    { $match: matchStage },
    { $unwind: '$timeline' },
    { $match: { 'timeline.type': 'Ligacao' } },
    { $count: 'total' }
  ];
  
  const documentosPipeline = [
    { $match: matchStage },
    { $match: { status: { $in: ['Aguardando Doc', 'Doc Completa', 'Em Análise'] } } },
    { $count: 'total' }
  ];
  
  const [ligacoesResult, documentosResult] = await Promise.all([
    collection.aggregate(ligacoesPipeline).toArray(),
    collection.aggregate(documentosPipeline).toArray()
  ]);

  return {
    vgvTotal: data.vgvTotal || 0,
    numeroLigacoes: ligacoesResult[0]?.total || 0,
    numeroDocumentos: documentosResult[0]?.total || 0,
    totalVendas: data.totalVendas,
    ticketMedio: Math.round(ticketMedio * 100) / 100,
    tempoMedioFechamento
  };
};

const calculateFunnel = async (startDate, endDate, userIds = null) => {
  const collection = getDb().collection('clientes');

  const matchStage = {
    'timeline.date': {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (userIds && userIds.length) {
    const { ObjectId } = require('mongodb');
    matchStage.ownerId = { $in: userIds.map(id => new ObjectId(id)) };
  }

  const pipeline = [
    {
      $match: matchStage
    },
    {
      $unwind: '$timeline'
    },
    {
      $match: {
        'timeline.date': {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        eventos: { $push: '$timeline.type' },
        statuses: { $push: '$status' }
      }
    },
    {
      $project: {
        temLigacao: { $in: ['Ligacao', '$eventos'] },
        temAtendimento: { $in: ['PrimeiroAtendimento', '$statuses'] },
        temInteressado: { $in: ['Interessado', '$statuses'] },
        temDocumentacao: { $in: ['DocumentacaoRecebida', '$statuses'] },
        temVenda: { $in: ['VendaGerada', '$eventos'] }
      }
    },
    {
      $group: {
        _id: null,
        ligacoes: { $sum: { $cond: ['$temLigacao', 1, 0] } },
        atendimentos: { $sum: { $cond: ['$temAtendimento', 1, 0] } },
        interessados: { $sum: { $cond: ['$temInteressado', 1, 0] } },
        documentacao: { $sum: { $cond: ['$temDocumentacao', 1, 0] } },
        vendas: { $sum: { $cond: ['$temVenda', 1, 0] } }
      }
    }
  ];

  const result = await collection.aggregate(pipeline).toArray();
  
  if (result.length === 0) {
    return {
      ligacoes: 0,
      atendimentos: 0,
      interessados: 0,
      documentacao: 0,
      vendas: 0,
      conversoes: {
        ligacaoParaAtendimento: 0,
        atendimentoParaInteressado: 0,
        interessadoParaDocumentacao: 0,
        documentacaoParaVenda: 0
      }
    };
  }

  const data = result[0];
  
  return {
    ligacoes: data.ligacoes,
    atendimentos: data.atendimentos,
    interessados: data.interessados,
    documentacao: data.documentacao,
    vendas: data.vendas,
    conversoes: {
      ligacaoParaAtendimento: data.ligacoes > 0 ? Math.round((data.atendimentos / data.ligacoes) * 100) : 0,
      atendimentoParaInteressado: data.atendimentos > 0 ? Math.round((data.interessados / data.atendimentos) * 100) : 0,
      interessadoParaDocumentacao: data.interessados > 0 ? Math.round((data.documentacao / data.interessados) * 100) : 0,
      documentacaoParaVenda: data.documentacao > 0 ? Math.round((data.vendas / data.documentacao) * 100) : 0
    }
  };
};
const calculateConversionSeries = async (startDate, endDate, userIds = null) => {
  const collection = getDb().collection('clientes');

  const matchBase = {};
  if (userIds && userIds.length) {
    const { ObjectId } = require('mongodb');
    matchBase.ownerId = { $in: userIds.map(id => new ObjectId(id)) };
  }

  const leadsPipeline = [
    { $match: matchBase },
    {
      $project: {
        createdAt: { $ifNull: ['$data_cadastro', { $min: '$timeline.date' }] }
      }
    },
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, leads: { $sum: 1 } } },
  ];

  const vendasPipeline = [
    { $match: matchBase },
    { $unwind: '$timeline' },
    { $match: { 'timeline.type': 'VendaGerada', 'timeline.date': { $gte: startDate, $lte: endDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timeline.date' } }, vendas: { $sum: 1 } } },
  ];

  const [leads, vendas] = await Promise.all([
    collection.aggregate(leadsPipeline).toArray(),
    collection.aggregate(vendasPipeline).toArray()
  ]);

  const byDay = new Map(leads.map(l => [l._id, { date: l._id, leads: l.leads, vendas: 0 }]));
  for (const v of vendas) {
    const row = byDay.get(v._id) || { date: v._id, leads: 0, vendas: 0 };
    row.vendas = v.vendas;
    byDay.set(v._id, row);
  }

  const days = [];
  const d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    const key = d.toISOString().split('T')[0];
    const row = byDay.get(key) || { date: key, leads: 0, vendas: 0 };
    const conversion = row.leads > 0 ? Math.round((row.vendas / row.leads) * 100) : 0;
    days.push({ ...row, conversion });
    d.setDate(d.getDate() + 1);
  }

  return days;
};

module.exports = {
  calculateKpis,
  calculateFunnel,
  calculateConversionSeries,
};
