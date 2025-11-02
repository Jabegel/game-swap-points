// ===================================================
// 🧠 Controle geral de autenticação e API
// ===================================================

const token = localStorage.getItem('token');
if (!token && location.pathname !== '/index.html' && location.pathname !== '/') {
  window.location = '/';
}

async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  opts.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
  const res = await fetch(path, opts);
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location = '/';
    throw new Error('unauthorized');
  }
  return res.json();
}

// ===================================================
// 👤 Carregar informações do usuário
// ===================================================

async function loadMe() {
  const me = await api('/api/me');
  document.getElementById('user-name').textContent = me.nome;
  document.getElementById('user-saldo').textContent = me.saldo;
}

// ===================================================
// 🎮 Carregar lista de jogos disponíveis
// ===================================================

async function loadGames(q = '') {
  const url = q ? '/api/games?q=' + encodeURIComponent(q) : '/api/games';
  const games = await api(url);
  const el = document.getElementById('games-list');
  el.innerHTML = '';
  if (!games.length) {
    el.innerHTML = '<p>Nenhum jogo encontrado.</p>';
    return;
  }

  games.forEach(g => {
    const col = document.createElement('div');
    col.className = 'col';
    const div = document.createElement('div');
    div.className = 'card-game h-100';
    div.innerHTML = `
      <h4>${escapeHtml(g.titulo)}</h4>
      <p class="small">Proprietário: ${escapeHtml(g.proprietario)}</p>
      <p class="small">Custo: ${g.custo} pts</p>
      <p class="small">Status: ${g.status}</p>
    `;

    if (g.status === 'Disponível') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline-primary btn-sm mt-2';
      btn.textContent = 'Solicitar Empréstimo';
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
  const my = await api('/api/my-games');
  const el = document.getElementById('my-games');
  el.innerHTML = '';
  my.forEach(g => {
    const d = document.createElement('div');
    d.className = 'card-game';
    d.innerHTML = `
      <h4>${escapeHtml(g.titulo)}</h4>
      <p class="small">Custo: ${g.custo}</p>
      <p class="small">Status: ${g.status}</p>
    `;
    if (g.status === 'Disponível') {
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Editar';
      btnEdit.className = 'btn btn-sm btn-secondary mt-2';
      btnEdit.onclick = () => editGame(g);
      d.appendChild(btnEdit);
    }
    el.appendChild(d);
  });
}

// ===================================================
// 💸 Empréstimos
// ===================================================

async function loadLoans() {
  const loans = await api('/api/loans');
  const el = document.getElementById('loans-list');
  el.innerHTML = '';
  loans.forEach(l => {
    const d = document.createElement('div');
    d.className = 'card-game';
    d.innerHTML = `
      <h4>${escapeHtml(l.titulo)}</h4>
      <p class="small">Status: ${l.status}</p>
    `;
    if (l.status === 'Solicitado' && l.id_proprietario === getUserIdFromToken()) {
      const btnConfirm = document.createElement('button');
      btnConfirm.className = 'btn btn-success btn-sm mt-2';
      btnConfirm.textContent = 'Confirmar';
      btnConfirm.onclick = () => confirmLoan(l.id_emprestimo);
      d.appendChild(btnConfirm);
    }
    if (l.status === 'Confirmado' && l.id_proprietario === getUserIdFromToken()) {
      const btnReturn = document.createElement('button');
      btnReturn.className = 'btn btn-warning btn-sm mt-2';
      btnReturn.textContent = 'Marcar Devolvido';
      btnReturn.onclick = () => returnLoan(l.id_emprestimo);
      d.appendChild(btnReturn);
    }
    el.appendChild(d);
  });
}

// ===================================================
// 🕓 Histórico
// ===================================================

async function loadHistory() {
  const h = await api('/api/history');
  const el = document.getElementById('history-list');
  el.innerHTML = '';
  h.forEach(t => {
    const p = document.createElement('div');
    p.className = 'card-game';
    p.innerHTML = `<p class="small">${t.tipo}: ${t.valor} pts - ${t.data}</p>`;
    el.appendChild(p);
  });
}

// ===================================================
// 🧩 Utilitários e ações
// ===================================================

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function getUserIdFromToken() {
  try {
    const t = localStorage.getItem('token');
    const p = JSON.parse(atob(t.split('.')[1]));
    return p.id_usuario;
  } catch (e) {
    return null;
  }
}

// ===================================================
// ➕ Adicionar novo jogo
// ===================================================

async function addGame() {
  const t = document.getElementById('g-titulo').value.trim();
  const d = document.getElementById('g-descricao').value.trim();
  const c = parseInt(document.getElementById('g-custo').value) || 0;
  if (!t) {
    alert('Título é requerido');
    return;
  }
  const res = await api('/api/games', {
    method: 'POST',
    body: JSON.stringify({ titulo: t, descricao: d, custo: c })
  });
  if (res.error) {
    alert('Erro: ' + res.error);
    return;
  }
  alert('Jogo adicionado!');
  refreshAll();
}

// ===================================================
// 📅 Modal e lógica de empréstimo com data
// ===================================================

let selectedGameId = null;
let selectedGameTitle = "";

function solicitarEmprestimo(id, title) {
  selectedGameId = id;
  selectedGameTitle = title;
  document.getElementById("modal-game-name").innerText = `Jogo: ${title}`;
  const modal = new bootstrap.Modal(document.getElementById('loanModal'));
  modal.show();
}

document.getElementById("confirm-loan").addEventListener("click", async () => {
  const dataPrevista = document.getElementById("return-date").value;
  if (!dataPrevista) return alert("Por favor, selecione a data de devolução.");

  try {
    const res = await api("/api/loans", {
      method: "POST",
      body: JSON.stringify({ id_jogo: selectedGameId, data_prevista: dataPrevista })
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
// 🔁 Atualização geral da página
// ===================================================

function refreshAll() {
  loadMe();
  loadGames();
  loadMyGames();
  loadLoans();
  loadHistory();
}

// ===================================================
// 🚪 Logout e botões
// ===================================================

document.getElementById('btn-logout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location = '/';
});
document.getElementById('btn-refresh')?.addEventListener('click', () =>
  loadGames(document.getElementById('search').value)
);
document.getElementById('btn-add-game')?.addEventListener('click', addGame);

// Inicialização
if (location.pathname.endsWith('dashboard.html')) setTimeout(refreshAll, 200);
