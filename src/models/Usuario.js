const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    rol: {
      type: String,
      enum: ['instructor', 'estudiante'],
      required: true,
    },
    contacto: { type: String, required: true, trim: true }, // correo o telefono
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
