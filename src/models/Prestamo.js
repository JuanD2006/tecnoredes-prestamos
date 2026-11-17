const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema(
  {
    equipo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo', required: true },
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha_inicio: { type: Date, required: true },
    fecha_fin_prevista: { type: Date, required: true },
    fecha_devolucion_real: { type: Date, default: null },
    estado: {
      type: String,
      enum: ['activo', 'finalizado'],
      default: 'activo',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prestamo', prestamoSchema);
