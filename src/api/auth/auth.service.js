// src/api/auth/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../users/user.service'); // Importamos o serviço de usuário para buscar usuários
require('dotenv').config(); // Para acessar as variáveis de ambiente como JWT_SECRET

/**
 * Lida com a lógica de negócio do login.
 * @param {object} credentials - Contém o email e a senha do usuário.
 * @returns {Promise<object>} - Retorna um objeto com o token e o nome do usuário.
 */
const login = async ({ email, password }) => {
  // 1. Encontrar o usuário pelo email no banco de dados.
  // A busca é feita em minúsculas para ser case-insensitive.
  const user = await userService.findByEmail(email);

  // 2. Se nenhum usuário for encontrado com esse email, lançamos um erro.
  // É uma prática de segurança retornar uma mensagem genérica para não informar se o email existe ou não.
  if (!user) {
    throw new Error('Credenciais inválidas'); // Mensagem genérica
  }

  // 3. Comparar a senha fornecida com a senha criptografada (hash) que está no banco.
  // O bcrypt.compare faz isso de forma segura, sem nunca descriptografar a senha do banco.
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // 4. Se as senhas não corresponderem, lançamos o mesmo erro genérico.
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas'); // Mensagem genérica
  }

  // 5. Se as credenciais estiverem corretas, criamos o payload para o token JWT.
  // O payload contém informações que queremos associar ao token.
  const payload = {
  id: user._id,
  email: user.email,
  role: user.role, // <<< ADICIONE ESTA LINHA
};
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  // 7. Retornar o token gerado e o nome do usuário para o controller.
  return { token, userName: user.name };
};

module.exports = {
  login,
};