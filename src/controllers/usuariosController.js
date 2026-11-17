const Usuario = require('../models/Usuario');

// GET /api/usuarios
async function listarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find().sort({ nombre: 1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar usuarios', error: error.message });
  }
}

// POST /api/usuarios
async function crearUsuario(req, res) {
  try {
    const { nombre, rol, contacto } = req.body;
    if (!nombre || !rol || !contacto) {
      return res.status(400).json({ mensaje: 'nombre, rol y contacto son obligatorios' });
    }
    const nuevoUsuario = await Usuario.create({ nombre, rol, contacto });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
  }
}

module.exports = { listarUsuarios, crearUsuario };
