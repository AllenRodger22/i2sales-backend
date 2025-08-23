const { getDb } = require('../../config/database');

const calculateKpis = async (startDate, endDate) => {
  const collection = getDb().collection('clientes');

  const pipeline = [
    {
      $match: {
        'timeline.date': {
          $gte: startDate,
          $lte: endDate
        }
      }
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
      ticketMedio: 0,
      totalVendas: 0,
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
      tempoMedioFechamento = Math.round(tempoMedioMs / (1000 * 60 * 60 * 24)); // em dias
    }
  }

  return {
    vgvTotal: data.vgvTotal || 0,
    ticketMedio: Math.round(ticketMedio * 100) / 100,
    totalVendas: data.totalVendas,
    tempoMedioFechamento
  };
};

const calculateFunnel = async (startDate, endDate) => {
  const collection = getDb().collection('clientes');

  const pipeline = [
    {
      $match: {
        'timeline.date': {
          $gte: startDate,
          $lte: endDate
        }
      }
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

module.exports = {
  calculateKpis,
  calculateFunnel,
};
