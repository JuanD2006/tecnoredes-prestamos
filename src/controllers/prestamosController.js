const Prestamo = require('../models/Prestamo');
const Equipo = require('../models/Equipo');
const Usuario = require('../models/Usuario');
const { seCruzan, validarRango } = require('../utils/fechas');

// GET /api/prestamos?estado=activo
async function listarPrestamos(req, res) {
  try {
    const filtro = {};
    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }
    const prestamos = await Prestamo.find(filtro)
      .populate('equipo_id', 'nombre tipo estado')
      .populate('usuario_id', 'nombre rol contacto')
      .sort({ fecha_inicio: -1 });
    res.status(200).json(prestamos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar prestamos', error: error.message });
  }
}

// POST /api/prestamos
// Regla de negocio: no permitir un prestamo si el equipo ya tiene uno activo
// cuyo horario se cruce con el solicitado.
async function crearPrestamo(req, res) {
  try {
    const { equipo_id, usuario_id, fecha_inicio, fecha_fin_prevista } = req.body;

    if (!equipo_id || !usuario_id || !fecha_inicio || !fecha_fin_prevista) {
      return res.status(400).json({
        mensaje: 'equipo_id, usuario_id, fecha_inicio y fecha_fin_prevista son obligatorios',
      });
    }

    const rango = validarRango(fecha_inicio, fecha_fin_prevista);
    if (!rango.valido) {
      return res.status(400).json({ mensaje: rango.mensaje });
    }
    const { inicio, fin } = rango;

    const [equipo, usuario] = await Promise.all([
      Equipo.findById(equipo_id),
      Usuario.findById(usuario_id),
    ]);
    if (!equipo) return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Regla de negocio: no permitir un prestamo si el equipo ya tiene uno
    // activo cuyo horario se cruce con el solicitado (ver src/utils/fechas.js).
    const prestamosActivosDelEquipo = await Prestamo.find({ equipo_id, estado: 'activo' });
    const hayCruce = prestamosActivosDelEquipo.some((p) =>
      seCruzan(inicio, fin, p.fecha_inicio, p.fecha_fin_prevista)
    );

    if (hayCruce) {
      return res.status(409).json({
        mensaje: 'El equipo ya tiene un prestamo activo que se cruza con el horario solicitado',
      });
    }

    const nuevoPrestamo = await Prestamo.create({
      equipo_id,
      usuario_id,
      fecha_inicio: inicio,
      fecha_fin_prevista: fin,
    });

    equipo.estado = 'prestado';
    await equipo.save();

    res.status(201).json(nuevoPrestamo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
  }
}

// PATCH /api/prestamos/:id/devolver
async function devolverPrestamo(req, res) {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ mensaje: 'Prestamo no encontrado' });
    }
    if (prestamo.estado === 'finalizado') {
      return res.status(409).json({ mensaje: 'El prestamo ya fue devuelto' });
    }

    prestamo.fecha_devolucion_real = req.body.fecha_devolucion_real
      ? new Date(req.body.fecha_devolucion_real)
      : new Date();
    prestamo.estado = 'finalizado';
    await prestamo.save();

    // liberar el equipo solo si no tiene otro prestamo activo
    const otroActivo = await Prestamo.findOne({ equipo_id: prestamo.equipo_id, estado: 'activo' });
    if (!otroActivo) {
      await Equipo.findByIdAndUpdate(prestamo.equipo_id, { estado: 'disponible' });
    }

    res.status(200).json(prestamo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Id de prestamo invalido', error: error.message });
  }
}

module.exports = {
  listarPrestamos,
  crearPrestamo,
  devolverPrestamo,
};
