const express = require('express');
const router = express.Router();
const { registrarUsuario, obtenerUsuarios } = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/registrar', registrarUsuario);

// Ruta para obtener todos los usuarios
router.get('/obtener', obtenerUsuarios);

module.exports = router;
