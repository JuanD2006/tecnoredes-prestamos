// Pruebas unitarias de la regla de negocio (sin base de datos).
// Ejecutar con: node test/fechas.test.js
const assert = require('assert');
const { seCruzan, validarRango } = require('../src/utils/fechas');

let fallas = 0;
function check(cond, msg) {
  if (cond) {
    console.log(`OK   - ${msg}`);
  } else {
    console.log(`FAIL - ${msg}`);
    fallas++;
  }
}

const d = (s) => new Date(s);

// --- seCruzan ---
check(
  seCruzan(d('2026-10-20T08:00'), d('2026-10-20T10:00'), d('2026-10-20T09:00'), d('2026-10-20T11:00')) === true,
  'Rangos que se solapan parcialmente se detectan como cruce'
);
check(
  seCruzan(d('2026-10-20T08:00'), d('2026-10-20T10:00'), d('2026-10-20T10:00'), d('2026-10-20T12:00')) === false,
  'Rangos consecutivos (uno termina cuando empieza el otro) NO son cruce'
);
check(
  seCruzan(d('2026-10-20T08:00'), d('2026-10-20T12:00'), d('2026-10-20T09:00'), d('2026-10-20T10:00')) === true,
  'Un rango contenido dentro de otro se detecta como cruce'
);
check(
  seCruzan(d('2026-10-20T08:00'), d('2026-10-20T09:00'), d('2026-10-20T10:00'), d('2026-10-20T11:00')) === false,
  'Rangos completamente separados NO son cruce'
);

// --- validarRango ---
let r = validarRango('2026-10-20T08:00:00.000Z', '2026-10-20T10:00:00.000Z');
check(r.valido === true, 'Rango con inicio antes que fin es valido');

r = validarRango('2026-10-20T10:00:00.000Z', '2026-10-20T08:00:00.000Z');
check(r.valido === false, 'Rango con inicio despues del fin es invalido');

r = validarRango('fecha-mala', '2026-10-20T08:00:00.000Z');
check(r.valido === false, 'Fecha de inicio no parseable es invalida');

console.log('\n--- RESUMEN ---');
if (fallas === 0) {
  console.log('Todas las pruebas unitarias de la regla de negocio pasaron.');
} else {
  console.log(`${fallas} prueba(s) fallaron.`);
  process.exit(1);
}
