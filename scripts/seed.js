require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../src/models/Usuario');
const Equipo = require('../src/models/Equipo');

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tecnoredes_prestamos';
  await mongoose.connect(uri);

  const usuarios = [
    { nombre: 'Docente encargado', rol: 'instructor', contacto: 'docente@tecnoredes.local' },
    { nombre: 'Estudiante de demostración', rol: 'estudiante', contacto: 'estudiante@tecnoredes.local' },
  ];
  for (const usuario of usuarios) {
    await Usuario.updateOne({ contacto: usuario.contacto }, { $setOnInsert: usuario }, { upsert: true });
  }

  const equipos = [
    { nombre: 'Router TP-Link AC1200', tipo: 'Router', descripcion: 'Equipo para prácticas de redes inalámbricas.' },
    { nombre: 'Switch Cisco Catalyst 2960', tipo: 'Switch', descripcion: 'Equipo para prácticas de conmutación.' },
    { nombre: 'Portátil de laboratorio 01', tipo: 'Portátil', descripcion: 'Equipo portátil para configuración y diagnóstico.' },
  ];
  for (const equipo of equipos) {
    await Equipo.updateOne({ nombre: equipo.nombre }, { $setOnInsert: equipo }, { upsert: true });
  }

  console.log('Datos de demostración listos.');
  console.log('Encargado: Docente encargado / docente@tecnoredes.local');
  console.log('Estudiante: estudiante@tecnoredes.local');
  console.log('Reemplaza los datos demo por los datos autorizados del laboratorio.');
}

main().catch((error) => {
  console.error('No fue posible cargar los datos iniciales:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
