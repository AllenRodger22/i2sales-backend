// /src/server.js
const app = require('./app');
const { connectToDatabase } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();