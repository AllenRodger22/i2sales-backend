// /src/api/clientes/cliente.controller.js

const clienteService = require('./cliente.service');

// --- FUNÇÃO PARA CADASTRO MANUAL (PERMANECE IGUAL) ---
const createCliente = async (req, res) => {
  try {
    const clienteId = await clienteService.create(req.body, req.user.id);
    res.status(201).json({ id: clienteId, message: "Cliente criado com sucesso!" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- FUNÇÕES CRUD (PERMANECEM IGUAIS) ---
const getAllClientes = async (req, res) => {
  try {
    const clientes = await clienteService.findAll(req.user);
    res.status(200).json(clientes);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getClienteById = async (req, res) => {
  try {
    const cliente = await clienteService.findById(req.params.id, req.user);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json(cliente);
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const updateCliente = async (req, res) => {
  try {
    const updated = await clienteService.update(req.params.id, req.body, req.user);
    if (!updated) return res.status(404).json({ message: "Cliente não encontrado ou dados não modificados" });
    res.status(200).json({ message: "Cliente atualizado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const deleteCliente = async (req, res) => {
  try {
    const deleted = await clienteService.remove(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json({ message: "Cliente deletado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

// <--- REMOVIDA: A função antiga que recebia o arquivo CSV foi substituída.
// const uploadClientesCSV = async (req, res) => { ... };

const deleteAllClientes = async (req, res) => {
  try {
    // Esta função parece perigosa, mas estou mantendo-a como estava no seu original.
    // Considere adicionar uma verificação extra para ter certeza que apenas admins possam usá-la.
    const deletedCount = await clienteService.deleteAll(req.user); 
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
    const result = await clienteService.bulkImport(clientes, req.user);
    
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


module.exports = { 
  createCliente,       // Para o cadastro manual
  getAllClientes, 
  getClienteById, 
  updateCliente, 
  deleteCliente, 
  // uploadClientesCSV, // <--- REMOVIDO dos exports
  deleteAllClientes,
  bulkImportClientes   // <--- ADICIONADO: Para a importação em massa
};
