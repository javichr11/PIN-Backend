const express = require('express');
const { createComment, getCommentsByEvent, updateComment, deleteComment } = require('../controllers/commentsController.js');

const router = express.Router();

// Ruta para crear un comentario
router.post('/crear', createComment);

// Ruta para obtener comentarios de un evento (ahora acepta evento_id como parámetro)
router.get('/obtenercomentarios/:evento_id', getCommentsByEvent);

// Ruta para actualizar un comentario (necesita el comentario_id como parámetro)
router.put('/editar/:comentario_id', updateComment);

// Ruta para eliminar un comentario (necesita el comentario_id como parámetro)
router.delete('/eliminar/:comentario_id', deleteComment);

module.exports = router;