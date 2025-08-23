const csv = require('csv-parser');
const { Readable } = require('stream');

const parseFilename = (filename) => {
  const produtividadeRegex = /produtividade_(.+)_(\d{8})-(\d{8})\.csv$/;
  const clientesRegex = /clientes_(.+)_(.+)\.csv$/;
  
  const prodMatch = filename.match(produtividadeRegex);
  if (prodMatch) {
    return {
      type: 'produtividade',
      agentName: prodMatch[1].replace(/_/g, ' '),
      startDate: parseDate(prodMatch[2]),
      endDate: parseDate(prodMatch[3])
    };
  }
  
  const clientMatch = filename.match(clientesRegex);
  if (clientMatch) {
    return {
      type: 'clientes',
      agentName: clientMatch[1].replace(/_/g, ' '),
      description: clientMatch[2]
    };
  }
  
  return null;
};

const parseDate = (dateStr) => {
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = dateStr.substring(4, 8);
  return new Date(`${year}-${month}-${day}`);
};

const processProdutividadeCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const data = [];
    const readableStream = Readable.from(buffer.toString('utf-8'));
    
    readableStream
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => {
        data.push({
          data: new Date(row['Data']),
          ligacoes: parseInt(row['Ligações']) || 0,
          vendas: parseInt(row['Vendas']) || 0,
          contatosEfetivos: parseInt(row['Contatos Efetivos']) || 0
        });
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
};

const processClientesCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const data = [];
    const readableStream = Readable.from(buffer.toString('utf-8'));
    
    readableStream
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => {
        data.push({
          nome: row['Nome'],
          telefone: row['Telefone'],
          email: row['E-mail'],
          origem: row['Origem'],
          status: row['Status'],
          data_cadastro: row['Data Cadastro'],
          data_followup: row['Data Follow-up']
        });
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
};

module.exports = { 
  parseFilename, 
  processProdutividadeCSV, 
  processClientesCSV 
};
