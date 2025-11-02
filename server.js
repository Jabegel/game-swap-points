require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troca_secret';

app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'game_swap',
  waitForConnections: true,
  connectionLimit: 5
});

function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'token missing'});
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({error:'token invalid'});
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){ return res.status(401).json({error:'token invalid'}); }
}

// ---------- AUTH ----------
app.post('/auth/register', async (req,res) => {
  try{
    const { nome, email, senha } = req.body;
    if(!nome||!email||!senha) return res.status(400).json({error:'dados incompletos'});
    const hash = await bcrypt.hash(senha,10);
    const conn = await pool.getConnection();
    const [r] = await conn.query(
      'INSERT INTO usuarios (nome,email,senha,saldo) VALUES (?,?,?,50)',
      [nome,email,hash]
    );
    const [rows] = await conn.query('SELECT id_usuario,nome,email,saldo FROM usuarios WHERE id_usuario = ?',[r.insertId]);
    conn.release();
    res.status(201).json(rows[0]);
  }catch(err){
    if(err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({error:'email já cadastrado'});
    res.status(500).json({error:err.message});
  }
});

app.post('/auth/login', async (req,res) => {
  try{
    const { email, senha } = req.body;
    if(!email||!senha) return res.status(400).json({error:'dados incompletos'});
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM usuarios WHERE email = ?',[email]);
    conn.release();
    if(rows.length===0) return res.status(400).json({error:'credenciais inválidas'});
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if(!ok) return res.status(400).json({error:'credenciais inválidas'});
    const token = jwt.sign({ id_usuario: user.id_usuario, nome: user.nome, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id_usuario: user.id_usuario, nome: user.nome, email: user.email, saldo: user.saldo } });
  }catch(err){ res.status(500).json({error:err.message}); }
});

// ---------- API: users/games/loans/history ----------
app.get('/api/me', authMiddleware, async (req,res) => {
  try{
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id_usuario,nome,email,saldo FROM usuarios WHERE id_usuario = ?',[req.user.id_usuario]);
    conn.release();
    res.json(rows[0]);
  }catch(err){ res.status(500).json({error:err.message}); }
});

app.get('/api/games', authMiddleware, async (req,res) => {
  try{
    const q = req.query.q ? '%' + req.query.q + '%' : null;
    const conn = await pool.getConnection();
    const sql = q ? 'SELECT g.*, u.nome as proprietario FROM jogos g JOIN usuarios u ON u.id_usuario = g.id_proprietario WHERE g.titulo LIKE ?' : 'SELECT g.*, u.nome as proprietario FROM jogos g JOIN usuarios u ON u.id_usuario = g.id_proprietario';
    const [rows] = await conn.query(sql, q ? [q] : []);
    conn.release();
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }
});

app.post('/api/games', authMiddleware, async (req,res) => {
  try{
    const { titulo, descricao, custo } = req.body;
    if(!titulo) return res.status(400).json({error:'titulo requerido'});
    const conn = await pool.getConnection();
    const [r] = await conn.query('INSERT INTO jogos (id_proprietario,titulo,descricao,custo,status) VALUES (?,?,?,?,?)',[req.user.id_usuario,titulo,descricao||'',custo||0,'Disponível']);
    const [rows] = await conn.query('SELECT * FROM jogos WHERE id_jogo = ?',[r.insertId]);
    conn.release();
    res.status(201).json(rows[0]);
  }catch(err){ res.status(500).json({error:err.message}); }
});

// request loan (creates a pending loan with date)
app.post('/api/loans', authMiddleware, async (req,res) => {
  try{
    const { id_jogo, data_prevista } = req.body;
    if(!id_jogo||!data_prevista) return res.status(400).json({error:'id_jogo e data_prevista são obrigatórios'});
    const id_tomador = req.user.id_usuario;
    const conn = await pool.getConnection();
    const [games] = await conn.query('SELECT * FROM jogos WHERE id_jogo = ?',[id_jogo]);
    if(games.length===0){ conn.release(); return res.status(404).json({error:'jogo não encontrado'}); }
    const jogo = games[0];
    if(jogo.status !== 'Disponível'){ conn.release(); return res.status(400).json({error:'jogo não disponível'}); }
    if(jogo.id_proprietario === id_tomador){ conn.release(); return res.status(400).json({error:'proprietário não pode solicitar'}); }
    const [tomadorRows] = await conn.query('SELECT saldo,bloqueado FROM usuarios WHERE id_usuario = ?',[id_tomador]);
    const tomador = tomadorRows[0];
    if(tomador.bloqueado) { conn.release(); return res.status(400).json({error:'usuário bloqueado'}); }
    if(tomador.saldo < jogo.custo){ conn.release(); return res.status(400).json({error:'saldo insuficiente'}); }
    // create loan pending
    const [r] = await conn.query('INSERT INTO emprestimos (id_jogo,id_tomador,id_proprietario,data_fim,status,data_prevista) VALUES (?,?,?,?,?,?)',[id_jogo,id_tomador,jogo.id_proprietario,null,'Solicitado',data_prevista]);
    conn.release();
    res.status(201).json({id_emprestimo:r.insertId, message:'Solicitação enviada'});
  }catch(err){ res.status(500).json({error:err.message}); }
});

// owner confirms: transfer points, mark Emprestado and set data_inicio
app.post('/api/loans/confirm', authMiddleware, async (req,res) => {
  try{
    const { id_emprestimo } = req.body;
    if(!id_emprestimo) return res.status(400).json({error:'id_emprestimo requerido'});
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT e.*, j.custo, j.id_proprietario, j.id_jogo FROM emprestimos e JOIN jogos j ON j.id_jogo = e.id_jogo WHERE e.id_emprestimo = ?',[id_emprestimo]);
    if(rows.length===0){ conn.release(); return res.status(404).json({error:'emprestimo não encontrado'}); }
    const loan = rows[0];
    if(loan.id_proprietario !== req.user.id_usuario){ conn.release(); return res.status(403).json({error:'apenas proprietário pode confirmar'}); }
    if(loan.status !== 'Solicitado'){ conn.release(); return res.status(400).json({error:'estado inválido'}); }
    // transfer points
    const custo = loan.custo;
    const [tomadorRows] = await conn.query('SELECT saldo FROM usuarios WHERE id_usuario = ?',[loan.id_tomador]);
    if(tomadorRows[0].saldo < custo){ conn.release(); return res.status(400).json({error:'saldo insuficiente do tomador'}); }
    await conn.beginTransaction();
    await conn.query('UPDATE usuarios SET saldo = saldo - ? WHERE id_usuario = ?',[custo, loan.id_tomador]);
    await conn.query('UPDATE usuarios SET saldo = saldo + ? WHERE id_usuario = ?',[custo, loan.id_proprietario]);
    await conn.query('UPDATE jogos SET status = ? WHERE id_jogo = ?',['Emprestado', loan.id_jogo]);
    await conn.query('UPDATE emprestimos SET status = ?, data_inicio = NOW() WHERE id_emprestimo = ?',['Ativo', id_emprestimo]);
    await conn.query('INSERT INTO historico (id_usuario,tipo,valor) VALUES (?,?,?)',[loan.id_tomador,'Empréstimo - Saída', -custo]);
    await conn.query('INSERT INTO historico (id_usuario,tipo,valor) VALUES (?,?,?)',[loan.id_proprietario,'Empréstimo - Entrada', custo]);
    await conn.commit();
    conn.release();
    res.json({ok:true});
  }catch(err){ if(conn) await conn.rollback(); res.status(500).json({error:err.message}); }
});

// return loan (tomador or owner)
app.post('/api/loans/return', authMiddleware, async (req,res) => {
  try{
    const { id_emprestimo } = req.body;
    if(!id_emprestimo) return res.status(400).json({error:'id_emprestimo requerido'});
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT e.*, j.id_jogo, j.titulo, j.id_proprietario FROM emprestimos e JOIN jogos j ON j.id_jogo = e.id_jogo WHERE e.id_emprestimo = ?',[id_emprestimo]);
    if(rows.length===0){ conn.release(); return res.status(404).json({error:'emprestimo não encontrado'}); }
    const loan = rows[0];
    if(loan.id_tomador !== req.user.id_usuario && loan.id_proprietario !== req.user.id_usuario){ conn.release(); return res.status(403).json({error:'não autorizado'}); }
    if(loan.status === 'Devolvido'){ conn.release(); return res.status(400).json({error:'já devolvido'}); }
    await conn.beginTransaction();
    await conn.query('UPDATE emprestimos SET status = ?, data_fim = NOW() WHERE id_emprestimo = ?',['Devolvido', id_emprestimo]);
    await conn.query('UPDATE jogos SET status = ? WHERE id_jogo = ?',['Disponível', loan.id_jogo]);
    await conn.query('INSERT INTO historico (id_usuario,tipo,valor) VALUES (?,?,?)',[req.user.id_usuario, 'Devolução', 0]);
    await conn.commit();
    conn.release();
    res.json({ok:true});
  }catch(err){ if(conn) await conn.rollback(); res.status(500).json({error:err.message}); }
});

app.get('/api/loans', authMiddleware, async (req,res) => {
  try{
    const id = req.user.id_usuario;
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`SELECT e.id_emprestimo, j.titulo, e.status, e.data_inicio, e.data_fim, u1.nome AS tomador, u2.nome AS proprietario, e.id_tomador, e.id_proprietario FROM emprestimos e JOIN jogos j ON e.id_jogo = j.id_jogo JOIN usuarios u1 ON e.id_tomador = u1.id_usuario JOIN usuarios u2 ON e.id_proprietario = u2.id_usuario WHERE e.id_tomador = ? OR e.id_proprietario = ? ORDER BY e.data_inicio DESC`,[id,id]);
    conn.release();
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }
});

app.get('/api/history', authMiddleware, async (req,res) => {
  try{
    const id = req.user.id_usuario;
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT tipo, valor, DATE_FORMAT(data, "%d/%m/%Y %H:%i") AS data FROM historico WHERE id_usuario = ? ORDER BY data DESC',[id]);
    conn.release();
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }
});

// fallback serve home
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'public','home.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(port, ()=> console.log(`Server rodando em http://localhost:${port}`));
