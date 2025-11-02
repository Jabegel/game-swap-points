// Simple front JS for GameSwap (no frameworks)
const token = localStorage.getItem('token');
if(!token && !location.pathname.endsWith('/login.html') && !location.pathname.endsWith('/register.html') && !location.pathname.endsWith('/home.html')){
  window.location = '/login.html';
}

async function api(path, opts={}){
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  if(localStorage.getItem('token')) opts.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
  const res = await fetch(path, opts);
  if(res.status === 401){ localStorage.removeItem('token'); window.location = '/login.html'; throw new Error('unauthorized'); }
  return res.json();
}

async function loadMe(){ try{ const me = await api('/api/me'); document.getElementById('user-name').textContent = me.nome; document.getElementById('user-saldo').textContent = me.saldo; }catch(e){ console.error(e);} }

async function loadGames(q=''){ try{ const url = q? '/api/games?q='+encodeURIComponent(q) : '/api/games'; const games = await api(url); const el = document.getElementById('games-list'); el.innerHTML=''; if(!games.length){ el.innerHTML='<p class="text-muted">Nenhum jogo.</p>'; return;} games.forEach(g=>{ const col=document.createElement('div'); col.className='col-md-4'; const div=document.createElement('div'); div.className='card-game h-100'; div.innerHTML=`<h5>${escapeHtml(g.titulo)}</h5><p class="small">Proprietário: ${escapeHtml(g.proprietario)}</p><p class="small">Custo: ${g.custo} pts</p><p class="small">Status: ${g.status}</p>`; if(g.status==='Disponível'){ const btn=document.createElement('button'); btn.className='btn btn-sm btn-primary mt-2'; btn.textContent='Solicitar Empréstimo'; btn.onclick=()=> solicitarEmprestimo(g.id_jogo, g.titulo); div.appendChild(btn);} col.appendChild(div); el.appendChild(col); }); }catch(e){ console.error(e);} }

async function loadMyGames(){ try{ const my = await api('/api/my-games'); const el = document.getElementById('my-games'); el.innerHTML=''; if(!my.length){ el.innerHTML='<p class="text-muted">Nenhum jogo.</p>'; return;} my.forEach(g=>{ const d=document.createElement('div'); d.className='card-game col-md-4'; d.innerHTML=`<h5>${escapeHtml(g.titulo)}</h5><p class="small">Custo: ${g.custo}</p><p class="small">Status: ${g.status}</p>`; el.appendChild(d); }); }catch(e){ console.error(e);} }

async function loadLoans(){ try{ const loans = await api('/api/loans'); const el = document.getElementById('loans-list'); el.innerHTML=''; if(!loans.length){ el.innerHTML='<p class="text-muted">Nenhum empréstimo.</p>'; return;} loans.forEach(l=>{ const d=document.createElement('div'); d.className='card-game col-md-5 m-2'; d.innerHTML=`<h5>${escapeHtml(l.titulo)}</h5><p class="small">Tomador: ${escapeHtml(l.tomador)}</p><p class="small">Proprietário: ${escapeHtml(l.proprietario)}</p><p class="small">Status: ${l.status}</p><p class="small">De: ${l.data_inicio? new Date(l.data_inicio).toLocaleDateString() : '-'} até ${l.data_fim? new Date(l.data_fim).toLocaleDateString() : '-'}</p>`; if(l.status==='Ativo' && l.tomador === document.getElementById('user-name').textContent){ const btn=document.createElement('button'); btn.className='btn btn-sm btn-danger'; btn.textContent='Devolver'; btn.onclick=()=> devolverJogo(l.id_emprestimo); d.appendChild(btn);} el.appendChild(d); }); }catch(e){ console.error(e);} }

async function loadHistory(){ try{ const h = await api('/api/history'); const el = document.getElementById('history-list'); el.innerHTML=''; if(!h.length){ el.innerHTML='<p class="text-muted">Nenhum registro.</p>'; return;} h.forEach(t=>{ const p=document.createElement('div'); p.className='card-game'; p.innerHTML=`<p class="small">${t.tipo}: ${t.valor} pts - ${t.data}</p>`; el.appendChild(p); }); }catch(e){ console.error(e);} }

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// add game
document.getElementById('btn-add-game')?.addEventListener('click', async ()=>{ const t=document.getElementById('g-titulo').value.trim(); const d=document.getElementById('g-descricao').value.trim(); const c=parseInt(document.getElementById('g-custo').value)||0; if(!t){ alert('Título requerido'); return;} const res = await api('/api/games',{method:'POST', body: JSON.stringify({titulo:t,descricao:d,custo:c})}); if(res.error){ alert(res.error); return;} alert('Jogo adicionado'); refreshAll(); });

let selectedGameId=null;
function solicitarEmprestimo(id,title){ selectedGameId=id; document.getElementById('modal-game-name').textContent = title; const modal = new bootstrap.Modal(document.getElementById('loanModal')); modal.show(); }
document.getElementById('confirm-loan')?.addEventListener('click', async ()=>{ const date = document.getElementById('return-date').value; if(!date){ alert('Selecione data'); return;} const res = await api('/api/loans',{method:'POST', body: JSON.stringify({id_jogo:selectedGameId, data_prevista: date})}); if(res.error){ alert(res.error); return;} alert('Solicitação enviada'); refreshAll(); });

async function devolverJogo(id){ if(!confirm('Confirmar devolução?')) return; const res = await api('/api/loans/return',{method:'POST', body: JSON.stringify({id_emprestimo:id})}); if(res.error){ alert(res.error); return;} alert('Devolvido'); refreshAll(); }

function refreshAll(){ loadMe(); loadGames(); loadMyGames(); loadLoans(); loadHistory(); }

document.getElementById('btn-refresh')?.addEventListener('click', ()=> loadGames(document.getElementById('search').value));
document.getElementById('btn-logout')?.addEventListener('click', ()=>{ localStorage.removeItem('token'); window.location='/home.html'; });

if(location.pathname.endsWith('dashboard.html')) setTimeout(refreshAll,200);
