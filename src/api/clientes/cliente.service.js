// /src/api/clientes/cliente.service.js
const { getDb } = require('../../config/database');
const { ObjectId } = require('mongodb');
const csv = require('csv-parser');
const { Readable } = require('stream');
const collection = 'clientes';

/**
 * Cria um novo cliente, associando-o ao usuário logado.
 * @param {object} data - Os dados do cliente vindos do frontend.
 * @param {string} userId - O ID do usuário logado (vindo do req.user.id).
 */
const create = async (data, userId) => {
    const cliente = {
        ...data,
        ownerId: new ObjectId(userId), // Associa o cliente ao usuário que o criou.
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
    if (user.role !== 'manager' && user.role !== 'admin') {
        query.ownerId = new ObjectId(user.id); // Filtra os resultados pelo ID do dono
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
    if (!cliente) return null; // Se o cliente não existe, retorna nulo

    // Se o usuário não for manager E o dono do cliente não for ele, lança um erro de permissão
    if (user.role !== 'manager' && user.role !== 'admin' && cliente.ownerId.toString() !== user.id) {
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

const parseDateString = (dateString) => {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`);
};

/**
 * Processa um CSV e atribui todos os clientes importados ao usuário logado.
 * @param {Buffer} buffer - O buffer do arquivo CSV.
 * @param {object} user - O objeto do usuário logado.
 */
const importFromCSV = (buffer, user) => {
    return new Promise((resolve, reject) => {
        const clientesParaInserir = [];
        const readableStream = Readable.from(buffer.toString('utf-8'));

        readableStream
            .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => {
                try {
                    const anexos = JSON.parse(row['Anexos (JSON)']);
                    anexos.timeline = anexos.timeline.map(event => ({ ...event, date: new Date(event.date) }));

                    const clienteFormatado = {
                        ownerId: new ObjectId(user.id),
                        id_cliente: row['ID Cliente'],
                        nome: row['Nome'],
                        telefone: row['Telefone'],
                        email: row['E-mail'],
                        origem: row['Origem'],
                        status: row['Status'],
                        data_cadastro: parseDateString(row['Data Cadastro']),
                        data_followup: parseDateString(row['Data Follow-up']),
                        anexos: anexos,
                    };
                    clientesParaInserir.push(clienteFormatado);
                } catch (e) {
                    console.error('Erro ao processar linha do CSV:', row, e);
                }
            })
            .on('end', async () => {
                if (clientesParaInserir.length === 0) {
                    return resolve({ insertedCount: 0, message: "Nenhum cliente válido encontrado." });
                }
                try {
                    const result = await getDb().collection(collection).insertMany(clientesParaInserir, { ordered: false });
                    resolve(result);
                } catch (dbError) {
                    reject(dbError);
                }
            })
            .on('error', (error) => reject(error));
    });
};

/**
 * Retorna todos os leads arquivados (bolsão de leads)
 */
const findArchived = async () => {
    return await getDb().collection(collection).find({ isArchived: true }).toArray();
};

/**
 * Atribui um lead arquivado a um corretor
 */
const assignLead = async (leadId, userId) => {
    if (!ObjectId.isValid(leadId) || !ObjectId.isValid(userId)) {
        throw new Error('IDs inválidos fornecidos.');
    }

    const result = await getDb().collection(collection).updateOne(
        { _id: new ObjectId(leadId), isArchived: true },
        { 
            $set: { 
                ownerId: new ObjectId(userId),
                isArchived: false
            }
        }
    );

    return result.modifiedCount > 0;
};

/**
 * Arquiva um lead (move para o bolsão)
 */
const archiveLead = async (leadId, user) => {
    const lead = await findById(leadId, user);
    if (!lead) {
        throw new Error('Lead não encontrado ou sem permissão.');
    }

    const result = await getDb().collection(collection).updateOne(
        { _id: new ObjectId(leadId) },
        { 
            $set: { 
                ownerId: null,
                isArchived: true
            }
        }
    );

    return result.modifiedCount > 0;
};

/**
 * Busca todos os usuários corretores para seleção
 */
const findAllCorretores = async () => {
    return await getDb().collection('users').find({ role: 'user' }).toArray();
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove,
    importFromCSV,
    findArchived,
    assignLead,
    archiveLead,
    findAllCorretores,
};

