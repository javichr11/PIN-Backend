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
  const {userID} = req.body;
  await checkEvents(userID);
  res.json({ success: true });
});


//cron.schedule('* * * * *', checkUpcomingEvents);


//PRUEBA A MANO//


async function checkEvents(userID) {

  const formatoEspañol = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });


  console.log("El userID recibido es: ", userID);

  const nowUTC = new Date();
  console.log("Fecha actual");
  const now = formatoEspañol.format(nowUTC);
  console.log(now);

  //SELECCIONAR LAS INSCRIPCIONES CON USERID CORRESPONDIENTE Y NOTIFICACION FALSE

  const { data: inscripciones, errorInscripcion } = await supabase
    .from('inscripciones')
    .select(`
      id,
      userID,
      eventID
    `)
    .eq('notificacion_enviada', false)
    .eq('userID', userID);

    if (errorInscripcion) {
      console.error('Error comprobando las inscripciones:', errorInscripcion);
      return;
    }

    console.log("Las inscripciones son: ", inscripciones);

for(const inscripcion of inscripciones){
  try{

    console.log("Buscando eventos...");
    const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('nombre, fecha')
        .eq('id', inscripcion.eventID)
        .single();

      if (eventoError) {
        console.log("Error en la búsqueda de eventos");
        console.error(eventoError);
        continue;
      }
      console.log("Aquí ha recogido los eventos");
      const fecha = new Date(evento.fecha);
      const fechaEvento = formatoEspañol.format(fecha);
      console.log("Fecha del evento: ", fechaEvento);

      const tiempoRestante = fechaEvento.getTime() - now.getTime();
      console.log("El tiempo que resta es: ", tiempoRestante);

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


  }catch(error){
    console.error('Error al buscar el evento:', error);
  }
}

}








app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});