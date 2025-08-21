// /src/app.js
const express = require('express');
const cors = require('cors');

const clienteRoutes = require('./api/clientes/cliente.routes');
const authRoutes = require('./api/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);

app.get('/', (req, res) => {
  res.send('API do Sistema de Clientes está no ar!');
});

module.exports = app;