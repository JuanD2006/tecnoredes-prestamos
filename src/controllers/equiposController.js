const Equipo = require('../models/Equipo');
const Prestamo = require('../models/Prestamo');

// GET /api/equipos
async function listarEquipos(req, res) {
  try {
    const equipos = await Equipo.find().sort({ nombre: 1 });
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar equipos', error: error.message });
  }
}

// GET /api/equipos/:id
async function obtenerEquipo(req, res) {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }
    res.status(200).json(equipo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Id de equipo invalido', error: error.message });
  }
}

// POST /api/equipos
async function crearEquipo(req, res) {
  try {
    const { nombre, tipo, descripcion } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ mensaje: 'nombre y tipo son obligatorios' });
    }
    const nuevoEquipo = await Equipo.create({ nombre, tipo, descripcion });
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
  }
}

// PUT /api/equipos/:id
async function actualizarEquipo(req, res) {
  try {
    const { nombre, tipo, descripcion, estado } = req.body;
    const equipo = await Equipo.findByIdAndUpdate(
      req.params.id,
      { nombre, tipo, descripcion, estado },
      { new: true, runValidators: true }
    );
    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }
    res.status(200).json(equipo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
  }
}

// DELETE /api/equipos/:id
async function eliminarEquipo(req, res) {
  try {
    const prestamoActivo = await Prestamo.findOne({ equipo_id: req.params.id, estado: 'activo' });
    if (prestamoActivo) {
      return res.status(409).json({ mensaje: 'No se puede eliminar: el equipo tiene un prestamo activo' });
    }
    const equipo = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipo) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ mensaje: 'Id de equipo invalido', error: error.message });
  }
}

module.exports = {
  listarEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
};
