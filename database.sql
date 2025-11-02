-- Simple DB schema for GameSwap (run in MySQL)
CREATE DATABASE IF NOT EXISTS game_swap;
USE game_swap;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  saldo INT DEFAULT 50,
  bloqueado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jogos (
  id_jogo INT AUTO_INCREMENT PRIMARY KEY,
  id_proprietario INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  custo INT DEFAULT 0,
  status ENUM('Disponível','Emprestado','Devolvido') DEFAULT 'Disponível',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proprietario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS emprestimos (
  id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
  id_jogo INT NOT NULL,
  id_tomador INT NOT NULL,
  id_proprietario INT NOT NULL,
  data_inicio DATETIME,
  data_prevista DATE,
  data_fim DATETIME,
  status ENUM('Solicitado','Ativo','Devolvido') DEFAULT 'Solicitado',
  FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo),
  FOREIGN KEY (id_tomador) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_proprietario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS historico (
  id_historico INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo VARCHAR(150),
  valor INT DEFAULT 0,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
