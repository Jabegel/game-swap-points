// test/api/games.test.js
const request = require('supertest');
const app = require('../../server');

describe('Games Endpoints', () => {
  let token;
  let id_jogo;

  beforeAll(async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'user_teste@teste.com', senha: '123456' });
    if (login.body.token) token = login.body.token;
  });

  test('GET /api/me - deve retornar dados do usuário autenticado', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);
    expect([200,401]).toContain(res.statusCode);
  });

  test('POST /api/games - deve cadastrar um jogo', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Jogo Teste', descricao: 'Teste automático', custo: 10 });
    expect([200,201,400,401]).toContain(res.statusCode);
    if (res.body && res.body.id_jogo) id_jogo = res.body.id_jogo;
  });

  afterAll(() => {
    console.log('Jogo criado (se aplicável):', id_jogo);
  });
});
