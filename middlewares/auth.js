const jwt = require('jsonwebtoken');

// Middleware que exige un token JWT válido en el encabezado Authorization
// El cliente debe enviar:  Authorization: Bearer <token>
const verificarToken = (req, res, next) => {
  const encabezado = req.headers.authorization;

  // Si no viene el encabezado o no empieza con "Bearer ", no hay token
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado: falta el token de autenticación' });
  }

  // "Bearer abc123" -> nos quedamos solo con "abc123"
  const token = encabezado.split(' ')[1];

  try {
    // verify comprueba la firma con el JWT_SECRET y que el token no haya vencido
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos los datos del usuario en la petición para usarlos después si hace falta
    req.usuario = { id: payload.id, email: payload.email, rol: payload.rol };

    next(); // token válido: continúa hacia el endpoint
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError'
        ? 'El token ha expirado, inicia sesión de nuevo'
        : 'Token inválido';
    return res.status(401).json({ mensaje });
  }
};

module.exports = { verificarToken };