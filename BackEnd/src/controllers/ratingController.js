const supabase = require('../config/supabase');
// Crear una Valoracion
exports.createRating = async (req, res) => {
  const { evento_id, usuario_id, rating } = req.body;

  // Depurar para verificar que la solicitud llega
  console.log("Solicitud recibida para crear valoracion:", req.body);

  if (!evento_id || !usuario_id || rating === undefined || rating === null ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (rating < 0 || rating > 5){
    return res.status(400).json({ error: 'Puntaje no permitido' });
  }


  try {
    const { data: existingRating, error: ratingError } = await supabase
    .from('valoraciones')
    .select('id')
    .eq('evento_id', evento_id)
    .eq('usuario_id', usuario_id)
    .single();

    if (ratingError) {
      console.error("Error al verificar valoración existente:", ratingError);
      return res.status(500).json({ error: 'Error al verificar valoración existente' });
    }

    if (existingRating) {
      return res.status(400).json({ error: 'Ya has valorado este evento' });
    }

    const { data, error } = await supabase
    .from('valoraciones')
    .insert([{ evento_id, usuario_id, rating }]);

      if (error) {
          console.error("Error al crear valoracion en Supabase:", error);
          return res.status(500).json({ 
              error: 'Error al crear valoracion', 
              details: error.message || error 
          });
      }

      res.status(201).json({ message: 'Valoracion creado con éxito', data });
  } catch (err) {
      console.error("Error interno del servidor:", err);
      res.status(500).json({ 
          error: 'Error interno del servidor', 
          details: err.message 
      });
  }
};
  
  // Obtener Valoraciones por evento
  exports.getRatingsByEvent = async (req, res) => {
    const { evento_id } = req.params;
    
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('id, usuario_id, rating, created_at')
        .eq('evento_id', evento_id);
  
      if (error) {
        return res.status(500).json({ error: 'Error al obtener valoraciones' });
      }
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

   // Obtener Valoraciones por usuario
   exports.getRatingsByUser = async (req, res) => {
    const { usuario_id } = req.params;
  
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('id, evento_id, rating, created_at')
        .eq('usuario_id', usuario_id);
  
      if (error) {
        return res.status(500).json({ error: 'Error al obtener valoracions' });
      }
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  // Actualizar una Valoracion
  exports.updateRating = async (req, res) => {
    const { rating_id } = req.params;
    const { rating, usuario_id } = req.body;
  
    if (rating === undefined || rating === null || !usuario_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (rating < 0 || rating > 5){
      return res.status(400).json({ error: 'Puntaje no permitido' });
    }
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .update({ rating })
        .eq('id', rating_id)
        .eq('usuario_id', usuario_id);
      console.log(data);
      
      if (error) {
        return res.status(404).json({ error: 'Valoracion no encontrada o no autorizada' });
      }
  
      res.status(200).json({ message: 'Valoracion actualizado con éxito', data });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  // Eliminar un valoracion
  exports.deleteRating = async (req, res) => {
    const { rating_id } = req.params;
  
  
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .delete()
        .eq('id', rating_id);

      if (!data || data.length === 0) {
        return res.status(404).json({ data: 'Valoracion no encontrado o no autorizado' });
      }
  
      res.status(200).json({ message: 'Valoracion eliminado con éxito', data });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  //obtener media
  exports.getAverageRatingByEvent = async (req, res) => {
    const { evento_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('valoraciones')
            .select('rating')
            .eq('evento_id', evento_id);

        if (error) {
            return res.status(500).json({ error: 'Error al obtener valoraciones' });
        }
        if (data.length === 0) {
          return res.status(200).json({ averageRating: 0 }); // Si no hay valoraciones, la media es 0
      }

        // Calcular la media
        const averageRating = data.reduce((acc, val) => acc + val.rating, 0) / data.length;
        res.status(200).json({ averageRating });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};