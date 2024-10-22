const supabase = require('../config/supabase');
// Crear un comentario
exports.createComment = async (req, res) => {
    const { evento_id, usuario_id, content } = req.body;
  
    if (!evento_id || !usuario_id || !content) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
  
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert([{ evento_id, usuario_id, content }]);
  
      if (error) {
        return res.status(500).json({ error: 'Error al crear comentario' });
      }
  
      res.status(201).json({ message: 'Comentario creado con éxito', data });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  // Obtener comentarios por evento
  exports.getCommentsByEvent = async (req, res) => {
    const { evento_id } = req.params;
  
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select('id, usuario_id, content, created_at')
        .eq('evento_id', evento_id);
  
      if (error) {
        return res.status(500).json({ error: 'Error al obtener comentarios' });
      }
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  // Actualizar un comentario
  exports.updateComment = async (req, res) => {
    const { comentario_id } = req.params;
    const { content, usuario_id } = req.body;
  
    if (!content || !usuario_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
  
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .update({ content })
        .eq('id', comentario_id)
        .eq('usuario_id', usuario_id);
  
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Comentario no encontrado o no autorizado' });
      }
  
      res.status(200).json({ message: 'Comentario actualizado con éxito', data });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  // Eliminar un comentario
  exports.deleteComment = async (req, res) => {
    const { comentario_id } = req.params;
    const { usuario_id } = req.body;
  
    if (!usuario_id) {
      return res.status(400).json({ error: 'Usuario no identificado' });
    }
  
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', comentario_id)
        .eq('usuario_id', usuario_id);
  
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Comentario no encontrado o no autorizado' });
      }
  
      res.status(200).json({ message: 'Comentario eliminado con éxito', data });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };