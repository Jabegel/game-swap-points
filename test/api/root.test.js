const path = require('path');
const request = require('supertest');
const app = require(path.join(__dirname, '../../server'));

describe('Root route', () => {
  test('GET / responds 200 or redirect', async () => {
    const res = await request(app).get('/');
    expect([200,302]).toContain(res.statusCode);
  });
});
