const express = require('express');
const { createRating, getRatingsByUser, getRatingsByEvent, updateRating, deleteRating } = require('../controllers/RatingController.js');

const router = express.Router();

// Ruta para crear un comentario
router.post('/crear', createRating);

// Ruta para obtener comentarios de un evento (ahora acepta evento_id como parámetro)
router.get('/obtenervaloracion/evento/:evento_id', getRatingsByEvent);

// Ruta para obtener comentarios de un evento (ahora acepta evento_id como parámetro)
router.get('/obtenervaloracion/usuario/:usuario_id', getRatingsByUser);

// Ruta para actualizar un comentario (necesita el comentario_id como parámetro)
router.put('/editar/:rating_id', updateRating);

// Ruta para eliminar un comentario (necesita el comentario_id como parámetro)
router.delete('/eliminar/:rating_id', deleteRating);

module.exports = router;