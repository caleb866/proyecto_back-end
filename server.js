require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const productosRoutes = require('./routes/productos');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ mensaje: 'API de productos funcionando' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ api: 'ok', baseDeDatos: 'conectada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ api: 'ok', baseDeDatos: 'error de conexión' });
  }
});

// Todas las rutas de productos cuelgan de /productos
app.use('/productos', productosRoutes);

// Si ninguna ruta coincidió -> 404
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejador global de errores (los 4 parámetros lo identifican como tal)
app.use((error, req, res, next) => {
  // JSON mal escrito en el body
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});