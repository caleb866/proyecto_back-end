// Cargamos las variables de entorno antes que todo
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// CORS: permite que la página (en otro puerto) haga peticiones a esta API
app.use(cors());

// Permite leer el body de las peticiones cuando viene en formato JSON
app.use(express.json());

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: 'API de productos funcionando' });
});

// Ruta para comprobar que la conexión con MySQL funciona
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');   // consulta mínima para probar la conexión
    res.status(200).json({ api: 'ok', baseDeDatos: 'conectada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ api: 'ok', baseDeDatos: 'error de conexión' });
  }
});

// Arrancamos el servidor en el puerto del .env (o 3000 si no existe)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});