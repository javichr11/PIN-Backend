const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para crear un evento (con la imagen)
router.post('/crear', upload.single('foto'), eventController.crearEventos);

// Ruta para obtener todos los eventos
router.get('/obtener',eventController.obtenerEventos);
// Ruta para eliminar un evento
router.delete('/eliminar/:id', eventController.eliminarEvento);
// Ruta para inscribirse a un evento
router.post('/inscribir', eventController.inscribirAEvento);

module.exports = router;
