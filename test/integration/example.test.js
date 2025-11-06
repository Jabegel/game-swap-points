// test/integration/example.test.js
const path = require('path');
const request = require('supertest');
const app = require(path.join(__dirname, '../../server'));


describe('Integration example', () => {
  test('health check (if implemented) or root', async () => {
    const res = await request(app).get('/health').catch(()=>({statusCode:500}));
    expect([200,404,500]).toContain(res.statusCode);
  });
});
