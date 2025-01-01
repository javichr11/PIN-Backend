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

app.post('/notifications', async (req, res) => {
  const { userID } = req.body;
  const notifications = await checkEvents(userID);
  res.json(notifications);
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

  const nowUTC = new Date();
  const now = formatoEspañol.format(nowUTC);

  const [datePartNow, timePartNow] = now.split(', ');
  const [dayNow, monthNow, yearNow] = datePartNow.split('/');
  const [hourNow, minuteNow, secondNow] = timePartNow.split(':');
  
  const fechaNow = new Date(yearNow, monthNow - 1, dayNow, hourNow, minuteNow, secondNow);

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

for(const inscripcion of inscripciones){
  try{
    const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('nombre, fecha')
        .eq('id', inscripcion.eventID)
        .single();

      if (eventoError) {
        console.error("Error en la búsqueda de eventos");
        console.error(eventoError);
        continue;
      }
      const fechaEvento = new Date(evento.fecha);

      const tiempoRestante = fechaEvento.getTime() - fechaNow.getTime();

      const minutosRestantes = Math.floor(tiempoRestante / (1000 * 60));

      if (minutosRestantes > 0 && minutosRestantes <= 60) {
        const { data: noti, error: notiError } = await supabase
          .from('notificaciones')
          .insert({
            userID: userID,
            mensaje: `El evento ${evento.nombre} comenzará en menos de 1 hora`,
          });

          if(notiError){
            console.error('Error al insertar la notificación:', notiError);
          }

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

const { data: notifications, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('userID', userID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }

  return notifications;



}








app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});