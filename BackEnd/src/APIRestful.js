const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const insigniaRoutes = require('./routes/insigniaRoutes');
const cron = require('node-cron');
const fetch = require('node-fetch');
const supabase = require('./config/supabase'); 



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/evento', eventRoutes);
app.use('/comentario', commentsRoutes);
app.use('/valoracion', ratingRoutes);
app.use('/insignia', insigniaRoutes);

app.post('/test-notifications', async (req, res) => {
  await checkUpcomingEvents();
  res.json({ success: true });
});


cron.schedule('* * * * *', checkUpcomingEvents);


async function checkUpcomingEvents() {
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
  
  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select(`
      id,
      userID,
      eventID
    `)
    .eq('notificacion_enviada', false)
    .eq('userID', 33);

    console.log(inscripciones);
 
  if (error) {
    console.error('Error checking inscripciones:', error)
    return
  }

  for (const inscripcion of inscripciones) {
    try {
      // Obtener información del evento
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('nombre, fecha')
        .eq('id', inscripcion.eventID)
        .single()

      console.log(evento);
      if (eventoError){ 
        console.error(eventoError);
      }

      // Verificar si el evento está dentro del rango de tiempo
      const fechaEvento = new Date(evento.fecha)
      if (fechaEvento > new Date() && fechaEvento <= oneHourFromNow) {
        await supabase
          .from('notificaciones')
          .insert({
            userID: inscripcion.userID,
            mensaje: `El evento ${evento.nombre} comenzará en menos de una hora`,
          })

        await supabase
          .from('inscripciones')
          .update({ notificacion_enviada: true })
          .eq('id', inscripcion.id)

        console.log('Notificación enviada')
        console.log('Actualizada la notificación_enviada')
      }
    } catch (error) {
      console.error(`Error processing inscription ${inscripcion.id}:`, error)
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});