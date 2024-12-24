const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para registrar un usuario
//router.post('/registrar', registrarUsuario);
router.post('/registrar', upload.single('foto'), userController.registrarUsuario);
// Ruta para obtener todos los usuarios
router.get('/obtener', userController.obtenerUsuarios);

// Ruta para almacenar las preferencias de ususario
router.post('/preferencias', userController.registrarPreferencias);

//Ruta para almacenar o actualizar el token *********USAR AL HACER EL INICIO DE SESIÓN********
router.post('/token', userController.useToken);



module.exports = router;
