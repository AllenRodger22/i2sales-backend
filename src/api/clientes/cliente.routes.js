// /src/api/clientes/cliente.routes.js

const express = require('express');
const router = express.Router();
const controller = require('./cliente.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// O multer foi removido pois não é mais necessário para a nova abordagem
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------------------------------------------------
router.use(authMiddleware);
// ----------------------------------------------------------------------------------

// A rota antiga /upload foi removida para corrigir o erro
// router.post('/upload', upload.single('file'), controller.uploadClientesCSV);


/**
 * @route   POST /api/clientes/bulk-import
 * @desc    Recebe um ARRAY de clientes (JSON) para importação em massa.
 * @access  Privado (requer token)
 */
// Esta é a nova rota que chama a função correta que existe no seu controller
router.post('/bulk-import', controller.bulkImportClientes);


/**
 * @route   POST /api/clientes
 * @desc    Cria um novo cliente (Cadastro Manual)
 * @access  Privado (requer token)
 */
router.post('/', controller.createCliente);

/**
 * @route   GET /api/clientes
 * @desc    Obtém a lista de todos os clientes
 * @access  Privado (requer token)
 */
router.get('/', controller.getAllClientes);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obtém um cliente específico pelo ID
 * @access  Privado (requer token)
 */
router.get('/:id', controller.getClienteById);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Atualiza os dados de um cliente
 * @access  Privado (requer token)
 */
router.put('/:id', controller.updateCliente);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Deleta um cliente
 * @access  Privado (requer token)
 */
router.delete('/:id', controller.deleteCliente);


module.exports = router;
