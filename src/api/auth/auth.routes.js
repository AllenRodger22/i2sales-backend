// src/api/auth/auth.routes.js

const express = require('express');
const router = express.Router(); // Cria uma instância do roteador do Express
const controller = require('./auth.controller'); // Importa o controlador que criamos
const passport = require('passport');

/**
 * @route   POST /api/auth/register
 * @desc    Registra um novo usuário
 * @access  Público
 */
router.post('/register', controller.register);

/**
 * @route   POST /api/auth/login
 * @desc    Autentica um usuário e retorna um token JWT
 * @access  Público
 */
router.post('/login', controller.login);

/**
 * @route   GET /api/auth/google
 * @desc    Inicia o processo de autenticação com Google
 * @access  Público
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback do Google OAuth
 * @access  Público
 */
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  controller.googleCallback
);

// Exporta o roteador configurado para ser usado no arquivo principal app.js
module.exports = router;
