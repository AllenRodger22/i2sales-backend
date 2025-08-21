// src/api/clientes/cliente.controller.js
const clienteService = require('./cliente.service');

/**
 * Cria um novo cliente.
 */
const createCliente = async (req, res) => {
  try {
    // req.body contém os dados do cliente enviados pelo frontend
    const clienteId = await clienteService.create(req.body);
    res.status(201).json({ id: clienteId, message: "Cliente criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar cliente.", error: error.message });
  }
};

/**
 * Busca e retorna todos os clientes.
 */
const getAllClientes = async (req, res) => {
  try {
    const clientes = await clienteService.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar clientes.", error: error.message });
  }
};

/**
 * Busca e retorna um cliente específico pelo seu ID.
 */
const getClienteById = async (req, res) => {
  try {
    // req.params.id contém o ID enviado na URL (ex: /api/clientes/12345)
    const cliente = await clienteService.findById(req.params.id);

    // Se o serviço não encontrar o cliente, retorna 404
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar cliente.", error: error.message });
  }
};

/**
 * Atualiza um cliente existente.
 */
const updateCliente = async (req, res) => {
  try {
    const updated = await clienteService.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: "Cliente não encontrado ou nenhum dado foi modificado." });
    }

    res.status(200).json({ message: "Cliente atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar cliente.", error: error.message });
  }
};

/**
 * Deleta um cliente.
 */
const deleteCliente = async (req, res) => {
  try {
    const deleted = await clienteService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }
    
    res.status(200).json({ message: "Cliente deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar cliente.", error: error.message });
  }
};

/**
 * Processa o upload de um arquivo CSV de clientes.
 */
const uploadClientesCSV = async (req, res) => {
  // O middleware 'multer' coloca as informações do arquivo em req.file
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo foi enviado." });
  }

  try {
    // O conteúdo do arquivo está em req.file.buffer
    const result = await clienteService.importFromCSV(req.file.buffer);
    res.status(201).json({ message: "Arquivo processado com sucesso!", result });
  } catch (error) {
    res.status(500).json({ message: "Falha ao importar o arquivo CSV.", error: error.message });
  }
};


// Exporta todas as funções para serem usadas pelo cliente.routes.js
module.exports = {
  createCliente,
  getAllClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  uploadClientesCSV,
};