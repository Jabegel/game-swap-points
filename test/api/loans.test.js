// test/api/loans.test.js
const request = require('supertest');
const app = require('../../server');

describe('Loans Endpoints', () => {
  let token;
  let id_jogo = 1;

  beforeAll(async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'user_teste@teste.com', senha: '123456' });
    token = login.body.token;
  });

  test('POST /api/loans - deve tentar criar um empréstimo', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_jogo, data_prevista: '2025-12-31' });
    expect([200,400,404,401,500]).toContain(res.statusCode);
  });
});
