// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para ter acesso a process.env.JWT_SECRET

/**
 * Middleware para verificar a validade de um token JWT enviado no cabeçalho da requisição.
 * Se o token for válido, permite que a requisição prossiga. Caso contrário, envia uma
 * resposta de erro de autenticação.
 * @param {object} req - O objeto da requisição do Express.
 * @param {object} res - O objeto da resposta do Express.
 * @param {function} next - A função de callback para passar o controle para o próximo middleware.
 */
const authMiddleware = (req, res, next) => {
  // 1. Pega o token do cabeçalho 'Authorization'. O padrão é "Bearer <token>".
  const authHeader = req.headers.authorization;

  // 2. Verifica se o cabeçalho existe e se está no formato correto.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido ou formato inválido.' });
  }

  // 3. Extrai apenas a string do token, removendo o "Bearer ".
  const token = authHeader.split(' ')[1];

  // 4. Tenta verificar o token.
  try {
    // A função 'verify' faz duas coisas:
    // a) Decodifica o token.
    // b) Verifica se a assinatura é válida usando nosso JWT_SECRET.
    // Se o token estiver expirado ou a assinatura for inválida, ele lançará um erro.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Se o token for válido, anexa os dados decodificados (payload) ao objeto da requisição.
    // Isso é útil para que as próximas funções (os controladores) saibam quem é o usuário logado.
    req.user = decoded;

    // 6. Chama a função next() para permitir que a requisição continue para a rota solicitada.
    next();
  } catch (error) {
    // 7. Se jwt.verify lançar um erro, significa que o token não é válido.
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;