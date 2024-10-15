const express = require('express');
const router = express.Router();
const {obtenerEventos,crearEventos} = require('../controllers/eventController');

// Ruta para registrar un evento
router.post('/',crearEventos);

// Ruta para obtener todos los eventos
router.get('/',obtenerEventos);

module.exports = router;
