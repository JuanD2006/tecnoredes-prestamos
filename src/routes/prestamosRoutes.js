const express = require('express');
const router = express.Router();
const {
  listarPrestamos,
  crearPrestamo,
  devolverPrestamo,
} = require('../controllers/prestamosController');

router.get('/', listarPrestamos); // soporta ?estado=activo
router.post('/', crearPrestamo);
router.patch('/:id/devolver', devolverPrestamo);

module.exports = router;
