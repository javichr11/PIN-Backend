const express = require('express');
const router = express.Router();
const { registrarUsuario, obtenerUsuarios } = require('../controllers/userController');
const upload = require('multer')({ storage: multer.memoryStorage() });

// Ruta para registrar un usuario
//router.post('/registrar', registrarUsuario);
router.post('/usuario/registrar', upload.single('foto'), registrarUsuario);
// Ruta para obtener todos los usuarios
router.get('/obtener', obtenerUsuarios);

module.exports = router;
