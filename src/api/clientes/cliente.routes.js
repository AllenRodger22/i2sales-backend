// /src/api/clientes/cliente.routes.js
const express = require('express');
const router = express.Router(); // Cria a instância do roteador
const controller = require('./cliente.controller'); // Importa o controlador de clientes
const authMiddleware = require('../../middlewares/auth.middleware'); // Importa o middleware de autenticação
const multer = require('multer'); // Importa o multer para upload de arquivos

// Configura o multer para armazenar o arquivo temporariamente na memória
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------------------------------------------------
// APLICA O MIDDLEWARE DE AUTENTICAÇÃO A TODAS AS ROTAS DESTE ARQUIVO
// Qualquer requisição para /api/clientes/* passará por esta verificação primeiro.
router.use(authMiddleware);
// ----------------------------------------------------------------------------------

/**
 * @route   POST /api/clientes/upload
 * @desc    Faz o upload de um arquivo CSV para importar múltiplos clientes
 * @access  Privado (requer token)
 */
// Note como o middleware 'upload.single('file')' é colocado antes da função do controlador.
// 'file' deve ser o nome do campo no formulário de upload do frontend.
router.post('/upload', upload.single('file'), controller.uploadClientesCSV);

/**
 * @route   POST /api/clientes
 * @desc    Cria um novo cliente
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
<<<<<<< codex/add-apis-for-available-brokers-and-clients
=======
 * @route   GET /api/clientes/all
 * @desc    Obtém todos os clientes (apenas admin/manager)
 * @access  Privado (admin/manager)
 */
router.get('/all', controller.getAllClientesAll);

/**
 * @route   GET /api/clientes/corretores
 * @desc    Lista os corretores por nome
 * @access  Privado (admin/manager)
 */
router.get('/corretores', controller.listCorretores);

/**
 * @route   GET /api/clientes/corretor/:corretorId
 * @desc    Lista clientes de um corretor específico
 * @access  Privado (admin/manager)
 */
router.get('/corretor/:corretorId', controller.getClientesByCorretor);

/**
>>>>>>> main
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

// Exporta o roteador para ser usado no app.js
module.exports = router;
