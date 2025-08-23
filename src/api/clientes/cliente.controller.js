// /src/api/clientes/cliente.controller.js

const clienteService = require('./cliente.service');

// --- FUNÇÃO PARA CADASTRO MANUAL (PERMANECE IGUAL) ---
const createCliente = async (req, res) => {
  try {
    const clienteId = await clienteService.create(req.body, 'default-user');
    res.status(201).json({ id: clienteId, message: "Cliente criado com sucesso!" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- FUNÇÕES CRUD (PERMANECEM IGUAIS) ---
const getAllClientes = async (req, res) => {
  try {
    const clientes = await clienteService.findAll({ role: 'admin' });
    res.status(200).json(clientes);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getClienteById = async (req, res) => {
  try {
    const cliente = await clienteService.findById(req.params.id, { role: 'admin' });
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json(cliente);
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const updateCliente = async (req, res) => {
  try {
    const updated = await clienteService.update(req.params.id, req.body, { role: 'admin' });
    if (!updated) return res.status(404).json({ message: "Cliente não encontrado ou dados não modificados" });
    res.status(200).json({ message: "Cliente atualizado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const deleteCliente = async (req, res) => {
  try {
    const deleted = await clienteService.remove(req.params.id, { role: 'admin' });
    if (!deleted) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json({ message: "Cliente deletado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

/**
 * Faz upload de um arquivo CSV para importar múltiplos clientes
 */
const uploadClientesCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo foi enviado." });
    }

    const result = await clienteService.importFromCSV(req.file.buffer, { role: 'admin' });
    res.status(201).json({ 
      message: `${result.insertedCount} clientes foram importados com sucesso!`, 
      result 
    });
  } catch (error) {
    res.status(500).json({ message: "Falha ao importar arquivo CSV.", error: error.message });
  }
};

const deleteAllClientes = async (req, res) => {
  try {
    // Esta função parece perigosa, mas estou mantendo-a como estava no seu original.
    // Considere adicionar uma verificação extra para ter certeza que apenas admins possam usá-la.
    const deletedCount = await clienteService.deleteAll({ role: 'admin' }); 
    res.status(200).json({ 
      message: `Operação concluída. ${deletedCount} clientes foram deletados com sucesso.` 
    });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};


/**
 * <--- ADICIONADA: Nova função para a IMPORTAÇÃO EM MASSA (BULK).
 * Recebe um array de clientes no corpo da requisição e o passa para o serviço.
 */
const bulkImportClientes = async (req, res) => {
  try {
    const clientes = req.body; // O corpo da requisição deve ser o array de clientes.
    
    // Validação para garantir que o frontend enviou um array.
    if (!Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({ message: "O corpo da requisição deve ser um array de clientes." });
    }

    // Chama o serviço 'bulkImport' com o array e as informações do usuário.
    const result = await clienteService.bulkImport(clientes, { role: 'admin' });
    
    // Responde com sucesso, informando quantos clientes foram criados.
    res.status(201).json({ 
      message: `${result.insertedCount} clientes foram importados com sucesso!`, 
      result 
    });
  } catch (error) {
    // Em caso de erro no serviço, retorna um erro 500.
    res.status(500).json({ message: "Falha ao importar clientes.", error: error.message });
  }
};


/**
 * Retorna todos os leads arquivados (bolsão de leads)
 */
const getArchivedLeads = async (req, res) => {
  try {
    const archivedLeads = await clienteService.findArchived();
    res.status(200).json(archivedLeads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Atribui um lead arquivado a um corretor
 */
const assignLead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const assigned = await clienteService.assignLead(req.params.id, userId);
    if (!assigned) {
      return res.status(404).json({ message: "Lead não encontrado ou já atribuído." });
    }

    res.status(200).json({ message: "Lead atribuído com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Arquiva um lead (move para o bolsão)
 */
const archiveLead = async (req, res) => {
  try {
    const archived = await clienteService.archiveLead(req.params.id, { role: 'admin' });
    if (!archived) {
      return res.status(404).json({ message: "Lead não encontrado." });
    }

    res.status(200).json({ message: "Lead arquivado com sucesso!" });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

module.exports = { 
  createCliente,       // Para o cadastro manual
  getAllClientes, 
  getClienteById, 
  updateCliente, 
  deleteCliente, 
  uploadClientesCSV, // <--- RESTAURADO: Para upload de CSV
  deleteAllClientes,
  bulkImportClientes,   // <--- ADICIONADO: Para a importação em massa
  getArchivedLeads,
  assignLead,
  archiveLead,
};
