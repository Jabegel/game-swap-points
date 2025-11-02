// ===================================================
// 🧠 Controle geral de autenticação e API
// ===================================================

const token = localStorage.getItem("token");
if (!token && location.pathname !== "/index.html" && location.pathname !== "/") {
  window.location = "/";
}

async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers["Content-Type"] = "application/json";
  opts.headers["Authorization"] = "Bearer " + localStorage.getItem("token");

  const res = await fetch(path, opts);
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location = "/";
    throw new Error("unauthorized");
  }
  return res.json();
}

// ===================================================
// 👤 Carregar informações do usuário
// ===================================================

async function loadMe() {
  const me = await api("/api/me");
  document.getElementById("user-name").textContent = me.nome;
  document.getElementById("user-saldo").textContent = me.saldo;
}

// ===================================================
// 🎮 Listar jogos disponíveis
// ===================================================

async function loadGames(q = "") {
  const url = q ? "/api/games?q=" + encodeURIComponent(q) : "/api/games";
  const games = await api(url);
  const el = document.getElementById("games-list");
  el.innerHTML = "";

  if (!games.length) {
    el.innerHTML = '<p class="text-muted">Nenhum jogo encontrado.</p>';
    return;
  }

  games.forEach((g) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const div = document.createElement("div");
    div.className = "card-game h-100";
    div.innerHTML = `
      <h4>${escapeHtml(g.titulo)}</h4>
      <p class="small">Proprietário: ${escapeHtml(g.proprietario)}</p>
      <p class="small">Custo: ${g.custo} pts</p>
      <p class="small">Status: ${g.status}</p>
    `;

    if (g.status === "Disponível") {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary btn-sm mt-2";
      btn.textContent = "Solicitar Empréstimo";
      btn.onclick = () => solicitarEmprestimo(g.id_jogo, g.titulo);
      div.appendChild(btn);
    }

    col.appendChild(div);
    el.appendChild(col);
  });
}

// ===================================================
// 🕹️ Meus jogos
// ===================================================

async function loadMyGames() {
  const my = await api("/api/my-games");
  const el = document.getElementById("my-games");
  el.innerHTML = "";

  if (!my.length) {
    el.innerHTML = "<p class='text-muted'>Você ainda não cadastrou jogos.</p>";
    return;
  }

  my.forEach((g) => {
    const d = document.createElement("div");
    d.className = "card-game col-md-4";
    d.innerHTML = `
      <h4>${escapeHtml(g.titulo)}</h4>
      <p class="small">Custo: ${g.custo}</p>
      <p class="small">Status: ${g.status}</p>
    `;

    if (g.status === "Disponível") {
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.className = "btn btn-sm btn-secondary mt-2";
      btnEdit.onclick = () => editGame(g);
      d.appendChild(btnEdit);
    }

    el.appendChild(d);
  });
}

// ===================================================
// 🤝 Empréstimos
// ===================================================

async function loadLoans() {
  try {
    const loans = await api("/api/loans");
    const el = document.getElementById("loans-list");
    el.innerHTML = "";

    if (!loans || !loans.length) {
      el.innerHTML = '<p class="text-muted small">Nenhum empréstimo encontrado.</p>';
      return;
    }

    const userId = getUserIdFromToken();
    const userName = document.getElementById("user-name").textContent;

    loans.forEach((l) => {
      const div = document.createElement("div");
      div.className = "card-game col-md-5 m-2";
      div.innerHTML = `
        <h5 class="fw-bold mb-1">${escapeHtml(l.titulo)}</h5>
        <p class="small mb-1">Tomador: <strong>${escapeHtml(l.tomador)}</strong></p>
        <p class="small mb-1">Proprietário: <strong>${escapeHtml(l.proprietario)}</strong></p>
        <p class="small mb-1">Status: 
          <span class="badge ${l.status === "Ativo" ? "bg-success" : "bg-secondary"}">
            ${l.status}
          </span>
        </p>
        <p class="small mb-2">
          De: ${new Date(l.data_inicio).toLocaleDateString()} 
          até ${l.data_fim ? new Date(l.data_fim).toLocaleDateString() : "não definido"}
        </p>
      `;

      // 🟢 Botão Devolver (se o usuário for o tomador)
      if (l.status === "Ativo" && l.tomador === userName) {
        const btnReturn = document.createElement("button");
        btnReturn.textContent = "Devolver";
        btnReturn.className = "btn btn-outline-danger btn-sm";
        btnReturn.onclick = () => devolverJogo(l.id_emprestimo);
        div.appendChild(btnReturn);
      }

      el.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar empréstimos:", err);
  }
}

// ===================================================
// 🔁 Devolução de jogo (Tomador ou Proprietário)
// ===================================================
app.post('/api/loans/return', authMiddleware, async (req, res) => {
  const { id_emprestimo } = req.body;

  if (!id_emprestimo) {
    return res.status(400).json({ error: 'id_emprestimo requerido' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Busca o empréstimo e o jogo relacionados
    const [rows] = await conn.query(`
      SELECT e.*, j.titulo, j.id_proprietario, j.id_jogo
      FROM emprestimos e
      JOIN jogos j ON j.id_jogo = e.id_jogo
      WHERE e.id_emprestimo = ?
    `, [id_emprestimo]);

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const loan = rows[0];

    // ✅ Permite devolução tanto para o tomador quanto para o proprietário
    if (loan.id_tomador !== req.user.id_usuario && loan.id_proprietario !== req.user.id_usuario) {
      conn.release();
      return res.status(403).json({ error: 'Usuário não autorizado a devolver este jogo.' });
    }

    if (loan.status === 'Devolvido') {
      conn.release();
      return res.status(400).json({ error: 'Este empréstimo já foi devolvido.' });
    }

    // Atualiza status do empréstimo e do jogo
    await conn.beginTransaction();

    await conn.query(
      'UPDATE emprestimos SET status = ?, data_fim = NOW() WHERE id_emprestimo = ?',
      ['Devolvido', id_emprestimo]
    );

    await conn.query(
      'UPDATE jogos SET status = ? WHERE id_jogo = ?',
      ['Disponível', loan.id_jogo]
    );

    // Registra no histórico
    await conn.query(
      'INSERT INTO historico (id_usuario, tipo, valor, data) VALUES (?, ?, ?, NOW())',
      [req.user.id_usuario, `Devolução: ${loan.titulo}`, 0]
    );

    await conn.commit();
    conn.release();

    res.json({ success: true, message: `Jogo "${loan.titulo}" devolvido com sucesso!` });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Erro na devolução:', err);
    res.status(500).json({ error: 'Erro interno ao processar devolução.' });
  }
});


// ===================================================
// 📜 Histórico
// ===================================================

async function loadHistory() {
  const h = await api("/api/history");
  const el = document.getElementById("history-list");
  el.innerHTML = "";

  if (!h.length) {
    el.innerHTML = "<p class='text-muted small'>Nenhum registro encontrado.</p>";
    return;
  }

  h.forEach((t) => {
    const p = document.createElement("div");
    p.className = "card-game";
    p.innerHTML = `<p class="small">${t.tipo}: ${t.valor} pts - ${t.data}</p>`;
    el.appendChild(p);
  });
}

// ===================================================
// ➕ Adicionar novo jogo
// ===================================================

async function addGame() {
  const t = document.getElementById("g-titulo").value.trim();
  const d = document.getElementById("g-descricao").value.trim();
  const c = parseInt(document.getElementById("g-custo").value) || 0;

  if (!t) {
    alert("Título é requerido");
    return;
  }

  const res = await api("/api/games", {
    method: "POST",
    body: JSON.stringify({ titulo: t, descricao: d, custo: c }),
  });

  if (res.error) {
    alert("Erro: " + res.error);
    return;
  }

  alert("Jogo adicionado!");
  refreshAll();
}

// ===================================================
// 📅 Modal de solicitação de empréstimo
// ===================================================

let selectedGameId = null;

function solicitarEmprestimo(id, title) {
  selectedGameId = id;
  document.getElementById("modal-game-name").innerText = `Jogo: ${title}`;
  const modal = new bootstrap.Modal(document.getElementById("loanModal"));
  modal.show();
}

document.getElementById("confirm-loan").addEventListener("click", async () => {
  const dataPrevista = document.getElementById("return-date").value;
  if (!dataPrevista) return alert("Por favor, selecione a data de devolução.");

  try {
    const res = await api("/api/loans", {
      method: "POST",
      body: JSON.stringify({ id_jogo: selectedGameId, data_prevista: dataPrevista }),
    });

    if (res.error) {
      alert("Erro: " + res.error);
      return;
    }

    alert("✅ Empréstimo solicitado com sucesso!");
    refreshAll();
  } catch (err) {
    console.error(err);
    alert("Erro ao solicitar empréstimo.");
  }
});

// ===================================================
// 🧩 Utilitários e inicialização
// ===================================================

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function getUserIdFromToken() {
  try {
    const t = localStorage.getItem("token");
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.id_usuario;
  } catch (e) {
    return null;
  }
}

function refreshAll() {
  loadMe();
  loadGames();
  loadMyGames();
  loadLoans();
  loadHistory();
}

// ===================================================
// 🚪 Logout e inicialização
// ===================================================

document.getElementById("btn-logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location = "/home.html";
});

document.getElementById("btn-refresh")?.addEventListener("click", () =>
  loadGames(document.getElementById("search").value)
);

document.getElementById("btn-add-game")?.addEventListener("click", addGame);

if (location.pathname.endsWith("dashboard.html")) setTimeout(refreshAll, 200);
