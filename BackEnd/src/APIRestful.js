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
  const userID = 33;//req.body
  await checkUpcomingEvents(userID);
  res.json({ success: true });
});


//cron.schedule('* * * * *', checkUpcomingEvents);


async function checkUpcomingEvents(userID) {
  console.log("User recibido: ", userID);

  const UTC = new Date();
  const now = new Date(UTC.toLocaleString());

  console.log(UTC);
  console.log(now);

  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select(`
      id,
      userID,
      eventID
    `)
    .eq('notificacion_enviada', false)
    .eq('userID', userID)

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
      console.log("Los eventos a los que el usuario está inscrito son estos: ");
      console.log(evento);
      if (eventoError){ 
        console.error(eventoError);
      }

      // Verificar si el evento está dentro del rango de tiempo
      const fechaEvento = (new Date(evento.fecha));
      const tiempoRestante = fechaEvento - now;

      console.log("Fecha del evento: ", fechaEvento);
      console.log("Fecha actual: ", now)

      console.log(`Tiempo restante para el evento '${evento.nombre}': ${tiempoRestante} ms`);

      if (tiempoRestante > 0 && tiempoRestante <= 3600000) {

        console.log("Aquí ha entrado dentro del tiempo < de 1hora");

        await supabase
          .from('notificaciones')
          .insert({
            userID: inscripcion.userID,
            mensaje: `El evento ${evento.nombre} comenzará en menos de una hora`,
          });

        await supabase
          .from('inscripciones')
          .update({ notificacion_enviada: true })
          .eq('id', inscripcion.id);


        console.log("Aquí se debería de actualizar todo y enviar la notificación");  
        console.log(`Notificación enviada para usuario ${inscripcion.userID} sobre el evento '${evento.nombre}'`);
      }


    } catch (error) {
      console.error(`Error processing inscription ${inscripcion.id}:`, error)
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});