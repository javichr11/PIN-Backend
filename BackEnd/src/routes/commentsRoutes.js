import express from 'express';
import { createComment, getCommentsByEvent, updateComment, deleteComment } from '../controllers/commentsController.js';

const router = express.Router();

// Ruta para crear un comentario
router.post('/comments', createComment);

// Ruta para obtener comentarios de un evento
router.get('/comments/event/:evento_id', getCommentsByEvent);

// Ruta para actualizar un comentario
router.put('/comments/:comment_id', updateComment);

// Ruta para eliminar un comentario
router.delete('/comments/:comment_id', deleteComment);

export default router;