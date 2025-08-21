// /src/api/clientes/cliente.test.js

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;
let app; // Mova a variável app para ser definida no beforeAll

// --- BLOCO DE SETUP E TEARDOWN ---

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.DB_NAME = 'testDB';

  // --- PARTE CRÍTICA DA CORREÇÃO ---
  // Força o Jest a limpar o cache de módulos para que os arquivos
  // recarreguem com as novas variáveis de ambiente de teste.
  jest.resetModules();
  app = require('../../app'); // Recarrega o app com a nova configuração
  const { connectToDatabase } = require('../../config/database'); // Recarrega o database
  await connectToDatabase();
  // --- FIM DA CORREÇÃO ---

  const testUser = { name: 'Test User', email: 'test@example.com', password: 'password123' };
  await request(app).post('/api/auth/register').send(testUser);
  const response = await request(app).post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  token = response.body.token;
});

afterEach(async () => {
  const { getDb } = require('../../config/database');
  const db = getDb();
  if (db) {
    await db.collection('clientes').deleteMany({});
  }
});

afterAll(async () => {
  const { closeDatabase } = require('../../config/database');
  await mongoServer.stop();
  await closeDatabase(); // Usa a nova função para fechar a conexão
});


// --- SUÍTE DE TESTES (NENHUMA MUDANÇA NECESSÁRIA AQUI) ---
describe('API de Clientes (/api/clientes)', () => {
  it('deve retornar 401 Unauthorized se nenhum token for fornecido', async () => {
    const response = await request(app).get('/api/clientes');
    expect(response.statusCode).toBe(401);
  });

  it('deve retornar 200 e uma lista vazia', async () => {
    const response = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('deve retornar 201 e criar um novo cliente', async () => {
    const novoCliente = {
      nome: "Cliente de Teste",
      telefone: "(99) 99999-9999",
      email: "cliente.teste@example.com",
      origem: "Teste Automatizado",
      status: "Tratativa",
      anexos: { customFields: [], timeline: [] }
    };
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send(novoCliente);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
  
  it('deve encontrar um cliente recém-criado pelo seu ID', async () => {
     const clienteData = { nome: "Cliente Encontrado", email: "findme@test.com", status: "Novo", anexos: { customFields: [], timeline: [] } };
     const createResponse = await request(app).post('/api/clientes').set('Authorization', `Bearer ${token}`).send(clienteData);
     const clienteId = createResponse.body.id;
     const findResponse = await request(app).get(`/api/clientes/${clienteId}`).set('Authorization', `Bearer ${token}`);
     expect(findResponse.statusCode).toBe(200);
     expect(findResponse.body.nome).toBe(clienteData.nome);
     expect(findResponse.body._id).toBe(clienteId);
  });
});