const express = require('express');
const router = express.Router();
const { listarUsuarios, crearUsuario } = require('../controllers/usuariosController');

router.get('/', listarUsuarios);
router.post('/', crearUsuario);

module.exports = router;
