const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const { validarRegistro, validarLogin } = require('../middlewares/validaciones');

const router = express.Router();

// Cuántas "vueltas" de cifrado usa bcrypt: más alto = más seguro pero más lento (10 es el estándar)
const SALT_ROUNDS = 10;

// Respuesta de error para correo repetido (en formato por campo)
const errorCorreoRepetido = (res) =>
  res.status(400).json({
    mensaje: 'Datos inválidos',
    errores: { email: 'Este correo ya está registrado' }
  });

// POST /auth/registro -> crea un usuario (201)
router.post('/registro', validarRegistro, asyncHandler(async (req, res) => {
  const nombre = req.body.nombre.trim();
  const email = req.body.email.trim().toLowerCase(); // guardamos el correo en minúsculas
  const { password } = req.body;

  // ¿Ya existe un usuario con ese correo?
  const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existentes.length > 0) {
    return errorCorreoRepetido(res);
  }

  // Ciframos la contraseña: en la BD se guarda el hash, NUNCA la clave real
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );

    // El rol siempre es 'usuario' al registrarse (nunca lo aceptamos desde el body)
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: { id: resultado.insertId, nombre, email, rol: 'usuario' }
    });
  } catch (error) {
    // Si dos peticiones llegan a la vez con el mismo correo, el UNIQUE de MySQL lo detiene aquí
    if (error.code === 'ER_DUP_ENTRY') {
      return errorCorreoRepetido(res);
    }
    throw error;
  }
}));

// POST /auth/login -> verifica credenciales y entrega un token JWT (200) o 401
router.post('/login', validarLogin, asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const usuario = filas[0];

  // bcrypt.compare compara la clave escrita contra el hash guardado
  const claveCorrecta = usuario ? await bcrypt.compare(password, usuario.password) : false;

  // Mismo mensaje si el correo no existe o la clave está mal (no damos pistas a un atacante)
  if (!claveCorrecta) {
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
  }

  // Creamos el token: guarda id, email y rol, y lo firmamos con el secreto del .env
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  res.status(200).json({
    mensaje: 'Inicio de sesión exitoso',
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
  });
}));

module.exports = router;