// test/integration/db-connection.test.js
const mysql = require('mysql2/promise');

describe('Database Connection', () => {
  test('Conecta ao banco MySQL real (game_swap)', async () => {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'game_swap'
    });
    const [rows] = await conn.query('SHOW TABLES;');
    expect(Array.isArray(rows)).toBe(true);
    await conn.end();
  });
});

afterAll(async () => {
  if (app && app.close) app.close();
});
