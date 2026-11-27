// Campos que acepta el recurso productos
const CAMPOS = ['nombre', 'precio', 'stock', 'categoria'];

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

// Revisa los campos y devuelve un objeto con UN mensaje por cada campo con error
// parcial = true cuando es PATCH (solo se validan los campos que lleguen)
const generarErrores = (body, parcial) => {
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
const crearValidador = (parcial) => (req, res, next) => {
  const body = req.body || {}; // en Express 5, req.body puede ser undefined si no hay body

  // En PATCH debe llegar al menos un campo
  if (parcial && !CAMPOS.some((campo) => body[campo] !== undefined)) {
    return res.status(400).json({
      mensaje: 'Datos inválidos',
      errores: { general: 'Envía al menos un campo para actualizar' }
    });
  }

  const errores = generarErrores(body, parcial);

  // Si hay errores, respondemos 400 con el detalle por campo
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores });
  }

  next();
};

module.exports = {
  validarId,
  validarProducto: crearValidador(false),
  validarProductoParcial: crearValidador(true)
};