const express = require('express');
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const { verificarToken } = require('../middlewares/auth');
const { validarId, validarProducto, validarProductoParcial } = require('../middlewares/validaciones');

const router = express.Router();

// mysql2 devuelve DECIMAL como texto ("120000.00"); lo convertimos a número
const formatear = (producto) => ({ ...producto, precio: Number(producto.precio) });

// Busca un producto por id; devuelve undefined si no existe
const buscarPorId = async (id) => {
  const [filas] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return filas[0];
};

// Limpia y completa los datos para POST y PUT (reemplazo completo)
const normalizar = (body) => ({
  nombre: body.nombre.trim(),
  precio: Number(body.precio),
  stock: body.stock === undefined || body.stock === null || body.stock === '' ? 0 : Number(body.stock),
  categoria: body.categoria ? body.categoria.trim() : null
});

// Para PATCH: toma lo que llegó y deja lo demás como estaba en la BD
const aplicarCambios = (actual, body) => ({
  nombre: body.nombre !== undefined ? body.nombre.trim() : actual.nombre,
  precio: body.precio !== undefined ? Number(body.precio) : Number(actual.precio),
  stock:
    body.stock !== undefined && body.stock !== null && body.stock !== ''
      ? Number(body.stock)
      : actual.stock,
  categoria:
    body.categoria !== undefined
      ? (body.categoria ? body.categoria.trim() : null)
      : actual.categoria
});

// 1) GET /productos -> lista todos (200)  [PÚBLICO]
router.get('/', asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM productos ORDER BY id');
  res.status(200).json(filas.map(formatear));
}));

// 2) GET /productos/:id -> uno solo (200) o 404 si no existe  [PÚBLICO]
router.get('/:id', validarId, asyncHandler(async (req, res) => {
  const producto = await buscarPorId(req.params.id);
  if (!producto) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }
  res.status(200).json(formatear(producto));
}));

// 3) POST /productos -> crea (201)  [PROTEGIDO]
router.post('/', verificarToken, validarProducto, asyncHandler(async (req, res) => {
  const { nombre, precio, stock, categoria } = normalizar(req.body);

  const [resultado] = await pool.query(
    'INSERT INTO productos (nombre, precio, stock, categoria) VALUES (?, ?, ?, ?)',
    [nombre, precio, stock, categoria]
  );

  // insertId es el id que MySQL le asignó al nuevo registro
  const nuevo = await buscarPorId(resultado.insertId);
  res.status(201).json(formatear(nuevo));
}));

// 4) PUT /productos/:id -> reemplaza todo el producto (200) o 404  [PROTEGIDO]
router.put('/:id', verificarToken, validarId, validarProducto, asyncHandler(async (req, res) => {
  const existente = await buscarPorId(req.params.id);
  if (!existente) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  const { nombre, precio, stock, categoria } = normalizar(req.body);

  await pool.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
    [nombre, precio, stock, categoria, req.params.id]
  );

  const actualizado = await buscarPorId(req.params.id);
  res.status(200).json(formatear(actualizado));
}));

// 5) PATCH /productos/:id -> actualiza solo los campos enviados (200) o 404  [PROTEGIDO]
router.patch('/:id', verificarToken, validarId, validarProductoParcial, asyncHandler(async (req, res) => {
  const existente = await buscarPorId(req.params.id);
  if (!existente) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  const { nombre, precio, stock, categoria } = aplicarCambios(existente, req.body);

  await pool.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
    [nombre, precio, stock, categoria, req.params.id]
  );

  const actualizado = await buscarPorId(req.params.id);
  res.status(200).json(formatear(actualizado));
}));

// 6) DELETE /productos/:id -> elimina (204 sin cuerpo) o 404  [PROTEGIDO]
router.delete('/:id', verificarToken, validarId, asyncHandler(async (req, res) => {
  const existente = await buscarPorId(req.params.id);
  if (!existente) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  res.status(204).send();
}));

module.exports = router;