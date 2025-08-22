// /src/api/clientes/cliente.service.js

const { getDb } = require('../../config/database');
const { ObjectId } = require('mongodb');
// <--- REMOVIDO: Não são mais necessários, pois o frontend fará o parsing do CSV.
// const csv = require('csv-parser');
// const { Readable } = require('stream');

const collection = 'clientes';

/**
 * Cria um novo cliente, associando-o ao usuário logado.
 * @param {object} data - Os dados do cliente vindos do frontend.
 * @param {string} userId - O ID do usuário logado (vindo do req.user.id).
 */
const create = async (data, userId) => {
  const cliente = {
    ...data,
    ownerId: new ObjectId(userId),
    id_cliente: `${new Date().toISOString()}-${Math.random().toString(36).substr(2, 9)}`,
    data_cadastro: new Date(),
    data_followup: data.data_followup ? new Date(data.data_followup) : null,
  };
  const result = await getDb().collection(collection).insertOne(cliente);
  return result.insertedId;
};

/**
 * Retorna uma lista de clientes.
 * Se o usuário for 'admin', retorna todos.
 * Se for 'user', retorna apenas os que ele criou.
 * @param {object} user - O objeto do usuário logado (vindo do req.user).
 */
const findAll = async (user) => {
  const query = {};
  if (user.role !== 'admin') {
    query.ownerId = new ObjectId(user.id);
  }
  return await getDb().collection(collection).find(query).toArray();
};

/**
 * Encontra um cliente pelo ID e verifica se o usuário tem permissão para vê-lo.
 * @param {string} id - O ID do cliente a ser buscado.
 * @param {object} user - O objeto do usuário logado.
 */
const findById = async (id, user) => {
  if (!ObjectId.isValid(id)) return null;

  const cliente = await getDb().collection(collection).findOne({ _id: new ObjectId(id) });
  if (!cliente) return null;

  if (user.role !== 'admin' && cliente.ownerId.toString() !== user.id) {
    throw new Error('Acesso negado a este recurso.');
  }
  return cliente;
};

/**
 * Atualiza um cliente, verificando a permissão antes.
 * @param {string} id - O ID do cliente a ser atualizado.
 * @param {object} data - Os novos dados do cliente.
 * @param {object} user - O objeto do usuário logado.
 */
const update = async (id, data, user) => {
  const clienteExistente = await findById(id, user);
  if (!clienteExistente) {
    return false;
  }

  const { _id, ...updateData } = data;
  const result = await getDb().collection(collection).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return result.modifiedCount > 0;
};

/**
 * Remove um cliente, verificando a permissão antes.
 * @param {string} id - O ID do cliente a ser removido.
 * @param {object} user - O objeto do usuário logado.
 */
const remove = async (id, user) => {
  const clienteExistente = await findById(id, user);
  if (!clienteExistente) {
    return false;
  }
  
  const result = await getDb().collection(collection).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};

// <--- REMOVIDA: A função parseDateString provavelmente só era usada pela importFromCSV.
// Se você a usa em outro lugar, pode mantê-la.
// const parseDateString = (dateString) => { ... };


// <--- REMOVIDA: A função antiga que processava o buffer do CSV foi completamente substituída.
// const importFromCSV = (buffer, user) => { ... };


/**
 * <--- ADICIONADA: Nova função para importação em massa.
 * Recebe um array de objetos de cliente, formata-os com dados do backend e insere todos de uma vez.
 * @param {Array<object>} clientesArray - O array de clientes já processado pelo frontend.
 * @param {object} user - O objeto do usuário logado.
 */
const bulkImport = async (clientesArray, user) => {
  if (!clientesArray || clientesArray.length === 0) {
    return { insertedCount: 0, message: "Nenhum cliente para importar." };
  }

  // Prepara os dados: itera sobre o array para adicionar campos que são gerenciados pelo backend.
  const clientesParaInserir = clientesArray.map(cliente => {
    // Aqui assumimos que o frontend já enviou os dados mapeados corretamente
    // (ex: a chave é 'nome', 'email', etc.).
    return {
      ...cliente, // Pega os dados que vieram do frontend
      ownerId: new ObjectId(user.id), // Adiciona o ID do dono da importação
      data_cadastro: new Date(), // Define a data de cadastro como o momento da importação
      // Converte strings de data que vêm do frontend para objetos Date do MongoDB
      data_followup: cliente.data_followup ? new Date(cliente.data_followup) : null,
    };
  });

  // Usa "insertMany" para uma operação de escrita em massa, que é extremamente performática.
  const result = await getDb().collection(collection).insertMany(clientesParaInserir, { ordered: false });
  
  return result;
};


module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  // importFromCSV, // <--- REMOVIDO dos exports
  bulkImport,   // <--- ADICIONADO aos exports
};
