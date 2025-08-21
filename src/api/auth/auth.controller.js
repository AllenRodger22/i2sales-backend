// src/api/auth/auth.controller.js

const userService = require('../users/user.service');
const authService = require('./auth.service');

/**
 * Controlador para registrar um novo usuário no sistema.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação básica para garantir que os campos necessários foram enviados
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios."});
    }

    // Chama o serviço de usuário para criar o novo usuário no banco de dados
    const userId = await userService.create(req.body);

    // Retorna uma resposta de sucesso
    res.status(201).json({ id: userId, message: "Usuário registrado com sucesso!" });

  } catch (error) {
    // Em caso de erro (ex: email já existe), retorna uma mensagem de erro genérica
    res.status(500).json({ message: "Erro ao registrar usuário.", error: error.message });
  }
};

/**
 * Controlador para autenticar (logar) um usuário existente.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios."});
    }

    // Chama o serviço de autenticação para validar as credenciais e gerar um token
    const { token, userName } = await authService.login(req.body);
    
    // Retorna o token e uma mensagem de sucesso
    res.status(200).json({ token, userName, message: "Login bem-sucedido!" });

  } catch (error) {
    // Se o serviço retornar um erro (ex: senha incorreta), o status é 401 (Não Autorizado)
    res.status(401).json({ message: error.message });
  }
};

// Exporta as funções para serem usadas pelo arquivo de rotas (auth.routes.js)
module.exports = {
  register,
  login,
};