const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para crear un evento (con la imagen)
router.post('/crear', upload.single('foto'), eventController.crearEventos);

// Ruta para obtener todos los eventos
router.get('/obtener',eventController.obtenerEventos);
// Ruta para obtener los eventos posteriores a la fecha actual
router.get('obtenerPosteriores', eventController.obtenerPosteriores);
// Ruta para obtener los eventos creador por un usuario
router.get('/obtener/:userID', eventController.obtenerEventosPorAutor);
// Ruta para obtener un evento donde el usuario esta inscrito
router.get('/obtener/inscrito/:userID', eventController.obtenerEventosInscrito);
// Ruta para eliminar un evento
router.delete('/eliminar/:id', eventController.eliminarEvento);
// Ruta para inscribirse a un evento
router.post('/inscribir', eventController.inscribirAEvento);
// Ruta para obtener eventos filtrados por preferencias de usuario
router.get('/obtenerFiltrado/:userID', eventController.obtenerEventosFiltrados);

module.exports = router;
