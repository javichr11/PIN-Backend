const express = require('express');
const router = express.Router();
const { registrarUsuario, obtenerUsuarios } = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/', registrarUsuario);

// Ruta para obtener todos los usuarios
router.get('/', obtenerUsuarios);

module.exports = router;
