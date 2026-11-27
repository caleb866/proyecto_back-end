// Campos que acepta el recurso productos
const CAMPOS = ['nombre', 'precio', 'stock', 'categoria'];

// Expresión regular simple para comprobar el formato de un correo (algo@dominio.ext)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Si el objeto de errores tiene algo, responde 400 y devuelve true; si no, devuelve false
const responderSiHayErrores = (res, errores) => {
  if (Object.keys(errores).length > 0) {
    res.status(400).json({ mensaje: 'Datos inválidos', errores });
    return true;
  }
  return false;
};

// ---------------------------------------------------------------
// ID
// ---------------------------------------------------------------

// Valida que el :id de la URL sea un entero positivo
const validarId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'El id no es válido',
      errores: { id: 'El id debe ser un número entero positivo' }
    });
  }
  next();
};

// ---------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------

// Revisa los campos y devuelve un objeto con UN mensaje por cada campo con error
// parcial = true cuando es PATCH (solo se validan los campos que lleguen)
const generarErroresProducto = (body, parcial) => {
  const errores = {};
  const { nombre, precio, stock, categoria } = body;

  // --- nombre ---
  if (!parcial || nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      errores.nombre = 'El nombre es obligatorio';
    } else if (nombre.trim().length > 100) {
      errores.nombre = 'El nombre no puede superar los 100 caracteres';
    }
  }

  // --- precio ---
  if (!parcial || precio !== undefined) {
    if (precio === undefined || precio === null || precio === '') {
      errores.precio = 'El precio es obligatorio';
    } else if (Number.isNaN(Number(precio))) {
      errores.precio = 'El precio debe ser un número';
    } else if (Number(precio) < 0) {
      errores.precio = 'El precio no puede ser negativo';
    } else if (Number(precio) > 99999999.99) {
      errores.precio = 'El precio es demasiado grande';
    }
  }

  // --- stock (opcional) ---
  if (stock !== undefined && stock !== null && stock !== '') {
    if (!Number.isInteger(Number(stock))) {
      errores.stock = 'El stock debe ser un número entero';
    } else if (Number(stock) < 0) {
      errores.stock = 'El stock no puede ser negativo';
    }
  }

  // --- categoria (opcional) ---
  if (categoria !== undefined && categoria !== null) {
    if (typeof categoria !== 'string') {
      errores.categoria = 'La categoría debe ser texto';
    } else if (categoria.trim().length > 80) {
      errores.categoria = 'La categoría no puede superar los 80 caracteres';
    }
  }

  return errores;
};

// Fabrica el middleware: parcial=false para POST/PUT, parcial=true para PATCH
const crearValidadorProducto = (parcial) => (req, res, next) => {
  const body = req.body || {}; // en Express 5, req.body puede ser undefined si no hay body

  // En PATCH debe llegar al menos un campo
  if (parcial && !CAMPOS.some((campo) => body[campo] !== undefined)) {
    return res.status(400).json({
      mensaje: 'Datos inválidos',
      errores: { general: 'Envía al menos un campo para actualizar' }
    });
  }

  if (responderSiHayErrores(res, generarErroresProducto(body, parcial))) return;
  next();
};

// ---------------------------------------------------------------
// USUARIOS (registro y login)
// ---------------------------------------------------------------

const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body || {};
  const errores = {};

  // --- nombre ---
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    errores.nombre = 'El nombre es obligatorio';
  } else if (nombre.trim().length > 100) {
    errores.nombre = 'El nombre no puede superar los 100 caracteres';
  }

  // --- email ---
  if (typeof email !== 'string' || email.trim() === '') {
    errores.email = 'El correo es obligatorio';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errores.email = 'El correo no tiene un formato válido';
  } else if (email.trim().length > 150) {
    errores.email = 'El correo no puede superar los 150 caracteres';
  }

  // --- password ---
  if (typeof password !== 'string' || password === '') {
    errores.password = 'La contraseña es obligatoria';
  } else if (password.length < 8) {
    errores.password = 'La contraseña debe tener al menos 8 caracteres';
  } else if (Buffer.byteLength(password, 'utf8') > 72) {
    // bcrypt solo usa los primeros 72 bytes de la contraseña
    errores.password = 'La contraseña es demasiado larga (máximo 72 caracteres)';
  }

  if (responderSiHayErrores(res, errores)) return;
  next();
};

const validarLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errores = {};

  if (typeof email !== 'string' || email.trim() === '') {
    errores.email = 'El correo es obligatorio';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errores.email = 'El correo no tiene un formato válido';
  }

  if (typeof password !== 'string' || password === '') {
    errores.password = 'La contraseña es obligatoria';
  }

  if (responderSiHayErrores(res, errores)) return;
  next();
};

module.exports = {
  validarId,
  validarProducto: crearValidadorProducto(false),
  validarProductoParcial: crearValidadorProducto(true),
  validarRegistro,
  validarLogin
};