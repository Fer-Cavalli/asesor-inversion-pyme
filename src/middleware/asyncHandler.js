// Express 4 no captura rechazos de promesas en handlers async: si el
// controller tira, la request queda colgada en vez de llegar al
// errorHandler. Este wrapper lo resuelve sin tocar cada controller.
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = asyncHandler;
