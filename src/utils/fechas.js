// Utilidades de fechas para la regla de negocio de prestamos.
// Separadas del controlador para poder probarlas sin necesidad de base de datos.

/**
 * Indica si el rango [inicioA, finA] se cruza con [inicioB, finB].
 * Dos rangos se cruzan si uno empieza antes de que el otro termine
 * y termina despues de que el otro empiece.
 */
function seCruzan(inicioA, finA, inicioB, finB) {
  return inicioA < finB && finA > inicioB;
}

/**
 * Valida que fecha_inicio y fecha_fin_prevista formen un rango valido.
 * Devuelve { valido: true, inicio, fin } o { valido: false, mensaje }.
 */
function validarRango(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return { valido: false, mensaje: 'Las fechas enviadas no son validas' };
  }
  if (inicio >= fin) {
    return { valido: false, mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin' };
  }
  return { valido: true, inicio, fin };
}

module.exports = { seCruzan, validarRango };
