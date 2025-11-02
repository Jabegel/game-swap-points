DROP DATABASE IF EXISTS game_swap;
CREATE DATABASE IF NOT EXISTS game_swap;
USE game_swap;

-- ===================================================
-- 🧍‍♂️ Usuários
-- ===================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  saldo INT DEFAULT 50,
  bloqueado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 🎮 Jogos
-- ===================================================
CREATE TABLE IF NOT EXISTS jogos (
  id_jogo INT AUTO_INCREMENT PRIMARY KEY,
  id_proprietario INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  custo INT DEFAULT 0,
  status ENUM('Disponível', 'Emprestado') DEFAULT 'Disponível',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proprietario) REFERENCES usuarios(id_usuario)
);

-- ===================================================
-- 🤝 Empréstimos
-- ===================================================
CREATE TABLE IF NOT EXISTS emprestimos (
  id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
  id_jogo INT NOT NULL,
  id_tomador INT NOT NULL,
  id_proprietario INT NOT NULL,
  data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_fim DATETIME,
  status ENUM('Solicitado', 'Ativo', 'Devolvido') DEFAULT 'Solicitado',
  FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo),
  FOREIGN KEY (id_tomador) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_proprietario) REFERENCES usuarios(id_usuario)
);

-- ===================================================
-- 📜 Histórico
-- ===================================================
CREATE TABLE IF NOT EXISTS historico (
  id_historico INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo VARCHAR(100),
  valor INT DEFAULT 0,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
