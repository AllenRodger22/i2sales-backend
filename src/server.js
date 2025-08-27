// src/server.js
require('dotenv').config();              // 1) carrega env primeiro

const app = require('./app');            // 2) importa app
const { connectToDatabase } = require('./config/database'); // 3) DB (Mongo)

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDatabase();             // conecta no Mongo
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
  });
};

startServer();
