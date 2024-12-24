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
      eventos (
        id,
        nombre,
        fecha
      )
    `)
    .eq('notificacion_enviada', false)
    .gte('eventos.fecha', new Date().toISOString())
    .lte('eventos.fecha', oneHourFromNow.toISOString())

  if (error) {
    console.error('Error checking events:', error)
    return
  }

  for (const inscripcion of inscripciones) {
    try {
      await supabase
        .from('notificaciones')
        .insert({
          userID: inscripcion.userID,
          mensaje: `El evento ${inscripcion.eventos.nombre} comenzará en menos de una hora`,
          tipo: 'evento_proximo'
        })

      await supabase
        .from('inscripciones')
        .update({ notificacion_enviada: true })
        .eq('id', inscripcion.id)


      console.log('Notificación enviada');
      console.log('Actualizada la notificación_enviada');
    } catch (error) {
      console.error(`Error processing inscription ${inscripcion.id}:`, error)
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});