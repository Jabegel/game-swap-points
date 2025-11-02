DROP DATABASE IF EXISTS game_swap;
CREATE DATABASE IF NOT EXISTS game_swap DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_swap;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  saldo INT NOT NULL DEFAULT 50,
  bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jogos (
  id_jogo INT AUTO_INCREMENT PRIMARY KEY,
  id_proprietario INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  custo INT NOT NULL DEFAULT 0,
  status ENUM('Disponível','Emprestado') NOT NULL DEFAULT 'Disponível',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proprietario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emprestimos (
  id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
  id_jogo INT NOT NULL,
  id_tomador INT NOT NULL,
  id_proprietario INT NOT NULL,
  data_inicio DATETIME NOT NULL,
  data_fim DATE,
  status VARCHAR(20) DEFAULT 'Ativo'
);

CREATE TABLE IF NOT EXISTS historico (
  id_historico INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo VARCHAR(50),
  valor INT,
  data DATETIME
);


CREATE TABLE IF NOT EXISTS transacoes (
  id_transacao INT AUTO_INCREMENT PRIMARY KEY,
  id_origem INT,
  id_destino INT,
  valor INT NOT NULL,
  tipo ENUM('Emprestimo','Penalidade','Devolucao') NOT NULL,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_origem) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_destino) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS penalidades (
  id_penalidade INT AUTO_INCREMENT PRIMARY KEY,
  id_emprestimo INT NOT NULL,
  id_tomador INT NOT NULL,
  valor INT NOT NULL,
  motivo VARCHAR(255),
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_emprestimo) REFERENCES emprestimos(id_emprestimo) ON DELETE CASCADE,
  FOREIGN KEY (id_tomador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Seed: usuários e jogos de exemplo
INSERT INTO usuarios (nome,email,senha,saldo) VALUES
  ('Alice','alice@example.com','$2b$10$z1GQW8nZ6Xc0sYfO1h0uU.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 120),
  ('Bob','bob@example.com','$2b$10$z1GQW8nZ6Xc0sYfO1h0uU.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 80);

INSERT INTO jogos (id_proprietario,titulo,descricao,custo) VALUES
  (1,'Catan','Jogo de negociação e expansão de territórios',10),
  (1,'Carcassonne','Jogo de colocação de tiles',5),
  (2,'Dixit','Jogo de cartas imagético',8);
