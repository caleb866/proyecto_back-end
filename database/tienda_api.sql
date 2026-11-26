-- SQLBook: Code
-- Active: 1790987611998@@127.0.0.1@3306@tienda_api
CREATE DATABASE IF NOT EXISTS tienda_api;
USE tienda_api;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,      
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoria VARCHAR(80) NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, precio, stock, categoria) VALUES
  ('Teclado mecánico', 120000, 15, 'Periféricos'),
  ('Mouse inalámbrico', 55000, 30, 'Periféricos'),
  ('Monitor 24 pulgadas', 650000, 8, 'Pantallas');