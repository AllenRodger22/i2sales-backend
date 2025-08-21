// /src/api/clientes/cliente.controller.js

const clienteService = require('./cliente.service');

const createCliente = async (req, res) => {
  try {
    // Passa o ID do usuário logado para o serviço
    const clienteId = await clienteService.create(req.body, req.user.id);
    res.status(201).json({ id: clienteId, message: "Cliente criado com sucesso!" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllClientes = async (req, res) => {
  try {
    // Passa o objeto de usuário inteiro para o serviço
    const clientes = await clienteService.findAll(req.user);
    res.status(200).json(clientes);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getClienteById = async (req, res) => {
  try {
    // Passa req.user para a verificação de permissão
    const cliente = await clienteService.findById(req.params.id, req.user);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json(cliente);
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const updateCliente = async (req, res) => {
  try {
    // Passa req.user para a verificação de permissão
    const updated = await clienteService.update(req.params.id, req.body, req.user);
    if (!updated) return res.status(404).json({ message: "Cliente não encontrado ou dados não modificados" });
    res.status(200).json({ message: "Cliente atualizado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const deleteCliente = async (req, res) => {
  try {
    // Passa req.user para a verificação de permissão
    const deleted = await clienteService.remove(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ message: "Cliente não encontrado" });
    res.status(200).json({ message: "Cliente deletado com sucesso!" });
  } catch (error) { res.status(403).json({ message: error.message }); }
};

const uploadClientesCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Nenhum arquivo foi enviado." });
  try {
    // Passa req.user para que os clientes importados tenham um dono
    const result = await clienteService.importFromCSV(req.file.buffer, req.user);
    res.status(201).json({ message: "Clientes importados com sucesso!", result });
  } catch (error) { res.status(500).json({ message: "Falha ao importar o arquivo CSV.", error: error.message }); }
};
const deleteAllClientes = async (req, res) => {
  try {
    const deletedCount = await clienteService.deleteAll(req.user);
    res.status(200).json({ 
      message: `Operação concluída. ${deletedCount} clientes foram deletados com sucesso.` 
    });
  } catch (error) {
    // Se o serviço lançar o erro de "não é admin", o status será 403 Forbidden.
    res.status(403).json({ message: error.message });
  }
};

module.exports = { createCliente, getAllClientes, getClienteById, updateCliente, deleteCliente, uploadClientesCSV, deleteAllClientes };