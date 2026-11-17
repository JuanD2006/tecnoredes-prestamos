// Prueba de integracion end-to-end contra una base de datos MongoDB real.
//
// Este sandbox no tiene salida a internet para descargar un MongoDB
// temporal, asi que esta prueba se conecta a la base definida en
// MONGO_URI (o a mongodb://127.0.0.1:27017/tecnoredes_prestamos_test
// por defecto). Ejecutala en tu maquina o con Mongo en la nube:
//
//   MONGO_URI="mongodb://127.0.0.1:27017/tecnoredes_prestamos_test" npm run test:integracion
//
// Usa una base de datos de PRUEBA: el script borra sus colecciones antes
// y despues de correr.
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tecnoredes_prestamos_test';
  process.env.MONGO_URI = uri;
  process.env.PORT = process.env.PORT || 4000;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    console.log('No se pudo conectar a MongoDB en', uri);
    console.log('Levanta un MongoDB local (o apunta MONGO_URI a uno en la nube) y vuelve a intentar.');
    console.log('Detalle:', err.message);
    process.exit(1);
  }

  // Limpieza inicial
  await mongoose.connection.dropDatabase();

  const app = require('../src/app');
  const server = app.listen(process.env.PORT, () => {
    console.log(`Servidor de prueba en puerto ${process.env.PORT}`);
  });

  const base = `http://localhost:${process.env.PORT}`;
  let fallas = 0;

  function check(cond, msg) {
    if (cond) {
      console.log(`OK   - ${msg}`);
    } else {
      console.log(`FAIL - ${msg}`);
      fallas++;
    }
  }

  try {
    // 1. Crear usuario
    let r = await fetch(`${base}/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Juan Perez', rol: 'instructor', contacto: 'juan@tecnoredes.co' }),
    });
    let usuario = await r.json();
    check(r.status === 201, `POST /api/usuarios -> 201 (recibido ${r.status})`);

    // 2. Crear equipo
    r = await fetch(`${base}/api/equipos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Router TP-Link AC1200', tipo: 'Red', descripcion: 'Router para practicas' }),
    });
    let equipo = await r.json();
    check(r.status === 201, `POST /api/equipos -> 201 (recibido ${r.status})`);
    check(equipo.estado === 'disponible', 'Equipo nuevo queda en estado disponible');

    // 3. Listar equipos
    r = await fetch(`${base}/api/equipos`);
    let equipos = await r.json();
    check(r.status === 200 && equipos.length === 1, 'GET /api/equipos -> 200 con 1 equipo');

    // 4. Obtener equipo por id
    r = await fetch(`${base}/api/equipos/${equipo._id}`);
    check(r.status === 200, `GET /api/equipos/:id -> 200 (recibido ${r.status})`);

    // 5. Actualizar equipo (PUT)
    r = await fetch(`${base}/api/equipos/${equipo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Router TP-Link AC1200 v2', tipo: 'Red', descripcion: 'Actualizado', estado: 'disponible' }),
    });
    check(r.status === 200, `PUT /api/equipos/:id -> 200 (recibido ${r.status})`);

    // 6. Crear prestamo (debe quedar activo y equipo pasa a prestado)
    r = await fetch(`${base}/api/prestamos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipo_id: equipo._id,
        usuario_id: usuario._id,
        fecha_inicio: '2026-10-20T08:00:00.000Z',
        fecha_fin_prevista: '2026-10-20T10:00:00.000Z',
      }),
    });
    let prestamo = await r.json();
    check(r.status === 201, `POST /api/prestamos -> 201 (recibido ${r.status})`);

    r = await fetch(`${base}/api/equipos/${equipo._id}`);
    let equipoActualizado = await r.json();
    check(equipoActualizado.estado === 'prestado', 'El equipo pasa a estado "prestado" tras el prestamo');

    // 7. Intentar un segundo prestamo con horario cruzado -> debe fallar con 409
    r = await fetch(`${base}/api/prestamos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipo_id: equipo._id,
        usuario_id: usuario._id,
        fecha_inicio: '2026-10-20T09:00:00.000Z', // se cruza con 08:00-10:00
        fecha_fin_prevista: '2026-10-20T11:00:00.000Z',
      }),
    });
    check(r.status === 409, `POST /api/prestamos con cruce de horario -> 409 (recibido ${r.status})`);

    // 8. Un horario que NO se cruza si debe permitirse
    r = await fetch(`${base}/api/prestamos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipo_id: equipo._id,
        usuario_id: usuario._id,
        fecha_inicio: '2026-10-20T11:00:00.000Z',
        fecha_fin_prevista: '2026-10-20T12:00:00.000Z',
      }),
    });
    check(r.status === 201, `POST /api/prestamos sin cruce de horario -> 201 (recibido ${r.status})`);
    let segundoPrestamo = await r.json();

    // 9. Listar prestamos activos
    r = await fetch(`${base}/api/prestamos?estado=activo`);
    let activos = await r.json();
    check(r.status === 200 && activos.length === 2, `GET /api/prestamos?estado=activo -> 2 activos (recibidos ${activos.length})`);

    // 10. Intentar eliminar equipo con prestamo activo -> 409
    r = await fetch(`${base}/api/equipos/${equipo._id}`, { method: 'DELETE' });
    check(r.status === 409, `DELETE /api/equipos/:id con prestamo activo -> 409 (recibido ${r.status})`);

    // 11. Devolver el primer prestamo
    r = await fetch(`${base}/api/prestamos/${prestamo._id}/devolver`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha_devolucion_real: '2026-10-20T10:05:00.000Z' }),
    });
    let devuelto = await r.json();
    check(r.status === 200 && devuelto.estado === 'finalizado', `PATCH /api/prestamos/:id/devolver -> 200 finalizado (recibido ${r.status})`);

    // 12. El equipo sigue prestado porque el segundo prestamo sigue activo
    r = await fetch(`${base}/api/equipos/${equipo._id}`);
    let equipoTrasDevolucion = await r.json();
    check(equipoTrasDevolucion.estado === 'prestado', 'El equipo sigue "prestado" mientras tenga otro prestamo activo');

    // 13. Devolver el segundo prestamo -> equipo debe quedar disponible
    r = await fetch(`${base}/api/prestamos/${segundoPrestamo._id}/devolver`, { method: 'PATCH' });
    check(r.status === 200, `PATCH segundo prestamo -> 200 (recibido ${r.status})`);
    r = await fetch(`${base}/api/equipos/${equipo._id}`);
    let equipoFinal = await r.json();
    check(equipoFinal.estado === 'disponible', 'El equipo vuelve a "disponible" al devolver todos los prestamos');

    // 14. Ruta inexistente -> 404
    r = await fetch(`${base}/api/no-existe`);
    check(r.status === 404, `Ruta inexistente -> 404 (recibido ${r.status})`);

  } catch (err) {
    console.error('Error durante las pruebas:', err);
    fallas++;
  } finally {
    server.close();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  console.log('\n--- RESUMEN ---');
  if (fallas === 0) {
    console.log('Todas las pruebas de integracion pasaron correctamente.');
  } else {
    console.log(`${fallas} prueba(s) fallaron.`);
    process.exit(1);
  }
}

run();
