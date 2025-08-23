// src/api/users/user.service.js

const { getDb } = require('../../config/database');
const bcrypt = require('bcryptjs'); // Biblioteca para criptografar senhas

// Define o nome da coleção para ser usado neste serviço
const collection = 'users';

/**
 * Cria um novo usuário do sistema no banco de dados.
 * @param {object} userData - Objeto contendo nome, email e senha do novo usuário.
 * @returns {Promise<ObjectId>} O ID do novo usuário inserido.
 */
const create = async ({ name, email, password }) => {
  // 1. Criptografa a senha antes de salvá-la.
  // O segundo argumento '10' é o "salt round", que define a força da criptografia. 10 é um bom padrão.
  // NUNCA salve senhas em texto puro no banco de dados.
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Monta o objeto do usuário que será salvo.
  const user = {
    name,
    email: email.toLowerCase(), // Salva o email em minúsculas para evitar duplicidade e facilitar a busca.
    password: hashedPassword, 
    role: 'user',  // Salva a senha já criptografada.
    createdAt: new Date(),      // Adiciona uma data de criação para referência.
  };

  // 3. Insere o novo usuário na coleção 'users'.
  const result = await getDb().collection(collection).insertOne(user);
  
  // 4. Retorna o ID do usuário recém-criado.
  return result.insertedId;
};

/**
 * Encontra um usuário pelo seu endereço de email.
 * @param {string} email - O email a ser procurado.
 * @returns {Promise<object|null>} O documento do usuário encontrado ou nulo se não existir.
 */
const findByEmail = async (email) => {
  // Busca na coleção por um documento cujo campo 'email' corresponda ao fornecido (convertido para minúsculas).
  return await getDb().collection(collection).findOne({ email: email.toLowerCase() });
};

/**
 * Encontra todos os usuários com role 'user'
 */
const findAllCorretores = async () => {
  return await getDb().collection(collection).find({ role: 'user' }).toArray();
};

// Exporta as funções para que outros serviços (como o auth.service) possam usá-las.
module.exports = {
  create,
  findByEmail,
  findAllCorretores,
};
