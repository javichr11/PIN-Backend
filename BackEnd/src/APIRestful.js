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
  const userID = req.body;
  await checkEvents(userID);
  res.json({ success: true });
});


//cron.schedule('* * * * *', checkUpcomingEvents);


async function checkUpcomingEvents(userID) {
  console.log("User recibido:", userID);

  // Obtener fecha actual en UTC
  const now = new Date();

  console.log("Fecha y hora actual:", formatDate(now));

  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select(`
      id,
      userID,
      eventID
    `)
    .eq('notificacion_enviada', false)
    .eq('userID', userID);

  if (error) {
    console.error('Error checking inscripciones:', error);
    return;
  }

  console.log("Inscripciones encontradas:", inscripciones);

  for (const inscripcion of inscripciones) {
    try {
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('nombre, fecha')
        .eq('id', inscripcion.eventID)
        .single();

      if (eventoError) {
        console.error(eventoError);
        continue;
      }

      const fechaEvento = new Date(evento.fecha);
      const tiempoRestante = fechaEvento - now;

      console.log(`\nEvento: ${evento.nombre}`);
      console.log("Fecha del evento:", formatDate(fechaEvento));
      console.log("Tiempo restante:", Math.floor(tiempoRestante / 1000 / 60), "minutos");

      // Comprobar si el evento está a menos de una hora
      if (tiempoRestante > 0 && tiempoRestante <= 3600000) {
        console.log(`¡Alerta! El evento ${evento.nombre} comenzará en menos de una hora`);

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

        console.log("✓ Notificación enviada y registro actualizado");
      }

    } catch (error) {
      console.error(`Error procesando inscripción ${inscripcion.id}:`, error);
    }
  }
}


//PRUEBA A MANO//


async function checkEvents(userID) {

  console.log("El userID recibido es: ", userID);

  const now = new Date().toLocaleString;
  console.log(now);

}








app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});