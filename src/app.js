const express = require('express');
const cors = require('cors');

const equiposRoutes = require('./routes/equiposRoutes');
const prestamosRoutes = require('./routes/prestamosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API TecnoRedes - Prestamo de equipos de laboratorio' });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const conectado = mongoose.connection.readyState === 1;
  res.status(conectado ? 200 : 503).json({ api: 'ok', mongodb: conectado ? 'conectado' : 'desconectado' });
});

app.use('/api/equipos', equiposRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
