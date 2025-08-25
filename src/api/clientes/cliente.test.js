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

// --- SUÍTE DE TESTES ---
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

  it('deve retornar apenas os clientes pertencentes ao usuário autenticado', async () => {
    // Cria um cliente para o primeiro usuário (token já definido no beforeAll)
    const clienteUser1 = {
      nome: 'Cliente User1',
      email: 'cliente1@example.com',
      status: 'Novo',
      anexos: { customFields: [], timeline: [] },
    };
    await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send(clienteUser1);

    // Cria um segundo usuário e autentica
    const user2 = { name: 'User Two', email: 'user2@example.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(user2);
    const login2 = await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password });
    const token2 = login2.body.token;

    // O primeiro usuário deve ver 1 cliente
    const listUser1 = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);
    expect(listUser1.statusCode).toBe(200);
    expect(listUser1.body).toHaveLength(1);

    // O segundo usuário não deve ver nenhum cliente
    const listUser2 = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token2}`);
    expect(listUser2.statusCode).toBe(200);
    expect(listUser2.body).toHaveLength(0);
  });

  it('admin deve acessar todos os clientes via endpoint dedicado e manter funcionalidades especiais', async () => {
    const { getDb } = require('../../config/database');

    // Cria usuário admin e define role
    const admin = { name: 'Admin', email: 'admin@example.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(admin);
    await getDb().collection('users').updateOne({ email: admin.email.toLowerCase() }, { $set: { role: 'admin' } });
    const loginAdmin = await request(app).post('/api/auth/login').send({ email: admin.email, password: admin.password });
    const adminToken = loginAdmin.body.token;

    // Cria outro usuário e cliente associado
    const user = { name: 'Outro', email: 'outro@example.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(user);
    const loginUser = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    const userToken = loginUser.body.token;
    const clienteOutro = { nome: 'Cliente Outro', email: 'cliente.outro@example.com', status: 'Novo', anexos: { customFields: [], timeline: [] } };
    await request(app).post('/api/clientes').set('Authorization', `Bearer ${userToken}`).send(clienteOutro);

    // Cliente do admin
    const clienteAdmin = { nome: 'Cliente Admin', email: 'cliente.admin@example.com', status: 'Novo', anexos: { customFields: [], timeline: [] } };
    await request(app).post('/api/clientes').set('Authorization', `Bearer ${adminToken}`).send(clienteAdmin);

    // Admin deve ver apenas seus clientes no endpoint padrão
    const listAdmin = await request(app).get('/api/clientes').set('Authorization', `Bearer ${adminToken}`);
    expect(listAdmin.statusCode).toBe(200);
    expect(listAdmin.body).toHaveLength(1);

    // Admin pode ver todos os clientes no endpoint /all
    const listAdminAll = await request(app).get('/api/clientes/all').set('Authorization', `Bearer ${adminToken}`);
    expect(listAdminAll.statusCode).toBe(200);
    expect(listAdminAll.body).toHaveLength(2);

    // Usuário comum não pode acessar o endpoint /all
    const listUserAll = await request(app).get('/api/clientes/all').set('Authorization', `Bearer ${userToken}`);
    expect(listUserAll.statusCode).toBe(403);

    // Admin pode listar corretores
    const corretores = await request(app).get('/api/clientes/corretores').set('Authorization', `Bearer ${adminToken}`);
    expect(corretores.statusCode).toBe(200);
    const corretorOutro = corretores.body.find(c => c.name === user.name);
    expect(corretorOutro).toBeTruthy();

    // Admin pode buscar clientes de um corretor específico
    const clientesOutro = await request(app)
      .get(`/api/clientes/corretor/${corretorOutro.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(clientesOutro.statusCode).toBe(200);
    expect(clientesOutro.body).toHaveLength(1);
    expect(clientesOutro.body[0].email).toBe(clienteOutro.email);
  });
});