// /src/config/database.js

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error('MONGO_URI não definida.');
if (!dbName) throw new Error('DB_NAME não definida.');

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db;

const connectToDatabase = async () => {
  if (db) return;
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Conectado com sucesso ao MongoDB!");
    db = client.db(dbName);
  } catch (error) {
    console.error("Não foi possível conectar ao MongoDB.", error);
    process.exit(1);
  }
};

const getDb = () => {
  if (!db) throw new Error('A conexão com o banco não foi inicializada.');
  return db;
};

// --- ADICIONE ESTA FUNÇÃO ---
const closeDatabase = async () => {
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error('Erro ao fechar o MongoDB.', error);
    } finally {
      db = null;
    }
  }
};

module.exports = { connectToDatabase, getDb, closeDatabase }; // E EXPORTE-A AQUI