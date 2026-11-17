const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true }, // ej: Red, Portatil, Periferico
    estado: {
      type: String,
      enum: ['disponible', 'prestado'],
      default: 'disponible',
    },
    descripcion: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipo', equipoSchema);
