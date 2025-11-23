# Game Swap Points 🎮🔄

Este projeto é um sistema acadêmico de gerenciamento de empréstimo e troca de jogos, permitindo login, listagem de jogos, criação de empréstimos e interação via API e interface web.

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Iniciar o Servidor Node.js

Abra o terminal na raiz do projeto e execute:

```
npm install
node server.js
```

O backend estará rodando em:

👉 **http://localhost:3000**

---

## ▶️ Banco de Dados

O arquivo SQL está em:

```
database.sql
```

Execute-o para criar as tabelas e dados iniciais.

---

## 👤 Usuários de Teste (caso existam)

- **Login:** admin@admin.com  
- **Senha:** 123456  

---

## 🧪 Testes Automatizados

Os testes estão organizados na pasta:

```
test/
```

### ✔ Testes Unitários
```
npm test
```

### ✔ Cypress (interface)
```
npx cypress open
```

### ✔ Artillery — Teste de Carga / Estresse
```
npx artillery run test/load/games-load-test.yml
```

---

## 📁 Estrutura do Projeto

```
test/
 ├── unit/
 ├── api/
 ├── integration/
 ├── interface/
 ├── load/
 └── stress/
server.js
public/
database.sql
```

---

## 👥 Autores

- João Gabriel  
- Iago Juan  
- Ian  
- Ramyne  

---

📌 *Projeto desenvolvido para fins acadêmicos.*
