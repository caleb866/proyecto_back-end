// Envuelve una función async: si lanza un error, lo manda al manejador de errores
// Así no repetimos try/catch en cada endpoint
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};