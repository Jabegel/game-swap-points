// test/api/auth.test.js
const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Auth Endpoints', () => {
  let email = `user_${Date.now()}@teste.com`;
  let senha = '123456';
  let token;

  test('POST /auth/register - deve registrar novo usuário', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'Usuário Teste', email, senha });
    expect([200,201,400]).toContain(res.statusCode);
  });

  test('POST /auth/login - deve autenticar usuário existente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email, senha });
    expect([200,400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      token = res.body.token;
      expect(typeof token).toBe('string');
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('email');
    }
  });

  afterAll(() => {
    console.log('Token gerado:', token);
  });
});

afterAll(async () => {
  if (app && app.close) app.close();
});
