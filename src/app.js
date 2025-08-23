// /src/app.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

const clienteRoutes = require('./api/clientes/cliente.routes');
const authRoutes = require('./api/auth/auth.routes');
const ingestRoutes = require('./api/ingest/ingest.routes');
const biRoutes = require('./api/bi/bi.routes');
const userRoutes = require('./api/users/user.routes');
require('./config/passport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API do Sistema de Clientes está no ar!');
});

module.exports = app;
