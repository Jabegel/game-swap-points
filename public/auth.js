async function post(url, data){
  const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  return res.json();
}

document.getElementById('btn-register').addEventListener('click', async ()=>{
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-pass').value.trim();
  if(!nome||!email||!senha){ alert('Preencha todos os campos'); return; }
  const res = await post('/auth/register',{nome,email,senha});
  if(res && res.error){ alert('Erro: '+res.error); return; }
  alert('Registrado com sucesso. Faça login.');
});

document.getElementById('btn-login').addEventListener('click', async ()=>{
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-pass').value.trim();
  if(!email||!senha){ alert('Preencha todos os campos'); return; }
  const res = await post('/auth/login',{email,senha});
  if(res && res.error){ alert('Erro: '+res.error); return; }
  // save token and redirect to dashboard
  localStorage.setItem('token', res.token);
  window.location = '/dashboard.html';
});
