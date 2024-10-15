const express = require('express');
const router = express.Router();
const {obtenerEventos,crearEventos} = require('../controllers/eventController');

// Ruta para registrar un evento
router.post('/crear',crearEventos);

// Ruta para obtener todos los eventos
router.get('/obtener',obtenerEventos);

module.exports = router;
