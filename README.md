GameSwap - Scaffold Minimal (Node + MySQL)

Como usar:

1. Configure o banco MySQL e rode o script init_db.sql (ou crie o DB manualmente).
2. Edite o arquivo .env com as credenciais do MySQL (DB_HOST, DB_USER, DB_PASS).
3. Instale dependências: npm install
4. Rode: npm start
5. Acesse: http://localhost:3000/

Rotas principais:
- POST /auth/register { nome, email, senha }
- POST /auth/login { email, senha }
- GET /api/me (auth)
- GET /api/games (auth)
- POST /api/games (auth)
- POST /api/loans/request (auth)
- POST /api/loans/confirm (auth)
- POST /api/loans/return (auth)
- POST /api/loans/penalty (auth)
- GET /api/loans (auth)
- GET /api/history (auth)
