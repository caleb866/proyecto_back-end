require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,           // dónde está MySQL
  port: process.env.DB_PORT,           // puerto de MySQL
  user: process.env.DB_USER,           // usuario
  password: process.env.DB_PASSWORD,   // clave (viene del .env, no del código)
  database: process.env.DB_NAME,       // base de datos a usar
  waitForConnections: true,            // si todas están ocupadas, espera en vez de fallar
  connectionLimit: 10                  // máximo de conexiones simultáneas
});

// Exportamos el pool para usarlo en las rutas
module.exports = pool;