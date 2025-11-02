require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'trocasupersecreta';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================================================
// 🔌 Conexão com MySQL
// ===================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'game_swap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ===================================================
// 🔒 Middleware de autenticação
// ===================================================
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'token missing' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'token invalid' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'token invalid' });
  }
}

// ===================================================
// 👤 AUTENTICAÇÃO (Login / Registro)
// ===================================================
app.post('/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'dados incompletos' });
    const hash = await bcrypt.hash(senha, 10);

    const conn = await pool.getConnection();
    const [result] = await conn.query('INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)', [nome, email, hash]);
    const [rows] = await conn.query('SELECT id_usuario,nome,email,saldo,bloqueado FROM usuarios WHERE id_usuario = ?', [result.insertId]);
    conn.release();
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'email já cadastrado' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'dados incompletos' });

    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    conn.release();

    if (!rows.length) return res.status(400).json({ error: 'credenciais inválidas' });
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(400).json({ error: 'credenciais inválidas' });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, nome: user.nome, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id_usuario: user.id_usuario, nome: user.nome, email: user.email, saldo: user.saldo, bloqueado: user.bloqueado }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// 👥 USUÁRIOS
// ===================================================
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id_usuario, nome, email, saldo, bloqueado FROM usuarios WHERE id_usuario = ?',
      [req.user.id_usuario]
    );
    conn.release();
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id_usuario, nome, email, saldo, bloqueado, criado_em FROM usuarios ORDER BY nome'
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// 🎮 JOGOS
// ===================================================
app.get('/api/games', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q ? '%' + req.query.q + '%' : null;
    const conn = await pool.getConnection();
    const sql = q
      ? 'SELECT g.*, u.nome as proprietario FROM jogos g JOIN usuarios u ON u.id_usuario = g.id_proprietario WHERE g.titulo LIKE ?'
      : 'SELECT g.*, u.nome as proprietario FROM jogos g JOIN usuarios u ON u.id_usuario = g.id_proprietario';
    const [rows] = await conn.query(sql, q ? [q] : []);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/games', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, custo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'titulo requerido' });
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO jogos (id_proprietario,titulo,descricao,custo) VALUES (?,?,?,?)',
      [req.user.id_usuario, titulo, descricao || '', custo || 0]
    );
    const [rows] = await conn.query('SELECT * FROM jogos WHERE id_jogo = ?', [result.insertId]);
    conn.release();
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/my-games', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM jogos WHERE id_proprietario = ?', [req.user.id_usuario]);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// 🤝 EMPRÉSTIMOS + HISTÓRICO
// ===================================================

// Criar novo empréstimo
app.post('/api/loans', authMiddleware, async (req, res) => {
  try {
    const { id_jogo, data_prevista } = req.body;
    const id_tomador = req.user.id_usuario;

    const conn = await pool.getConnection();

    const [[jogo]] = await conn.query('SELECT * FROM jogos WHERE id_jogo = ?', [id_jogo]);
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    if (jogo.status !== 'Disponível') return res.status(400).json({ error: 'Jogo indisponível' });

    const [[tomador]] = await conn.query('SELECT saldo FROM usuarios WHERE id_usuario = ?', [id_tomador]);
    if (tomador.saldo < jogo.custo) return res.status(400).json({ error: 'Saldo insuficiente' });

    // Cria o empréstimo
    await conn.query(
      `INSERT INTO emprestimos (id_jogo, id_tomador, id_proprietario, data_inicio, data_fim, status)
       VALUES (?, ?, ?, NOW(), ?, 'Ativo')`,
      [id_jogo, id_tomador, jogo.id_proprietario, data_prevista]
    );

    // Atualiza saldo e status
    await conn.query('UPDATE usuarios SET saldo = saldo - ? WHERE id_usuario = ?', [jogo.custo, id_tomador]);
    await conn.query('UPDATE usuarios SET saldo = saldo + ? WHERE id_usuario = ?', [jogo.custo, jogo.id_proprietario]);
    await conn.query('UPDATE jogos SET status = "Emprestado" WHERE id_jogo = ?', [id_jogo]);

    // Histórico
    await conn.query(
      'INSERT INTO historico (id_usuario, tipo, valor, data) VALUES (?, ?, ?, NOW()), (?, ?, ?, NOW())',
      [id_tomador, 'Empréstimo - Saída', -jogo.custo, jogo.id_proprietario, 'Empréstimo - Entrada', jogo.custo]
    );

    conn.release();
    res.json({ success: true, message: 'Empréstimo criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os empréstimos do usuário
app.get('/api/loans', authMiddleware, async (req, res) => {
  try {
    const id = req.user.id_usuario;
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT e.id_emprestimo, j.titulo, e.status, e.data_inicio, e.data_fim,
             u1.nome AS tomador, u2.nome AS proprietario
      FROM emprestimos e
      JOIN jogos j ON e.id_jogo = j.id_jogo
      JOIN usuarios u1 ON e.id_tomador = u1.id_usuario
      JOIN usuarios u2 ON e.id_proprietario = u2.id_usuario
      WHERE e.id_tomador = ? OR e.id_proprietario = ?
      ORDER BY e.data_inicio DESC
    `, [id, id]);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Histórico de transações
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const id = req.user.id_usuario;
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT tipo, valor, DATE_FORMAT(data, '%d/%m/%Y %H:%i') AS data
      FROM historico
      WHERE id_usuario = ?
      ORDER BY data DESC
    `, [id]);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// 🌐 ROTAS FRONTEND (HTML)
// ===================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`🚀 Server rodando em http://localhost:${port}`));
