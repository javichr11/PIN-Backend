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

app.post('/notificaciones', async (req, res) => {
  const { userID } = req.body;
  const notifications = await checkEvents(userID);
  res.status(200).json(notifications);
});

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

  // Verificar inscripciones nuevas para notificar al creador del evento
  const { data: nuevasInscripciones, error: errorNuevasInscripciones } = await supabase
    .from('inscripciones')
    .select(`
      id,
      userID,
      eventID,
      notificacion_creador_enviada,
      usuarios!inscripciones_userID_fkey (
        nombre
      ),
      eventos!inscripciones_eventID_fkey (
        nombre,
        userID
      )
    `)
    .eq('notificacion_creador_enviada', false);

  if (errorNuevasInscripciones) {
    console.error('Error comprobando nuevas inscripciones:', errorNuevasInscripciones);
  } else {
    for (const inscripcion of nuevasInscripciones) {
      if (inscripcion.eventos.userID === userID) {
        try {
          const { error: notiError } = await supabase
            .from('notificaciones')
            .insert({
              userID: userID,
              eventID: inscripcion.eventID,
              mensaje: `${inscripcion.usuarios.nombre} se ha inscrito a tu evento "${inscripcion.eventos.nombre}"`,
              tipo: 'nueva_inscripcion'
            });

          if (notiError) {
            console.error('Error al insertar notificación de nueva inscripción:', notiError);
          } else {
            await supabase
              .from('inscripciones')
              .update({ notificacion_creador_enviada: true })
              .eq('id', inscripcion.id);
          }
        } catch (error) {
          console.error('Error al procesar nueva inscripción:', error);
        }
      }
    }
  }

  // Verificar próximos eventos
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

  for(const inscripcion of inscripciones) {
    try {
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
            eventID: inscripcion.eventID,
            mensaje: `El evento ${evento.nombre} comenzará en ${minutosRestantes} minutos. Date prisa!`,
            tipo: 'recordatorio_evento'
          });

        if(notiError) {
          console.error('Error al insertar la notificación:', notiError);
        }

        await supabase
          .from('inscripciones')
          .update({ notificacion_enviada: true })
          .eq('id', inscripcion.id);

        console.log("✓ Notificación enviada y registro actualizado");
      }
    } catch(error) {
      console.error('Error al buscar el evento:', error);
    }
  }

  // Obtener todas las notificaciones
  const { data: notificaciones, error } = await supabase
    .from('notificaciones')
    .select(`
      *,
      eventos (
        fecha,
        nombre
      )
    `)
    .eq('userID', userID)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }

  console.log("Notificaciones sin filtrar:", notificaciones);

  // Filtramos las notificaciones
  const notificacionesFiltradas = notificaciones.filter(notificacion => {
    // Para notificaciones de nueva inscripción, mostrar siempre
    if (notificacion.tipo === 'nueva_inscripcion') {
      return true;
    }
    
    // Para recordatorios de eventos
    if (notificacion.tipo === 'recordatorio_evento' && notificacion.eventos) {
      const fechaEvento = new Date(notificacion.eventos.fecha);
      const fechaCreacion = new Date(notificacion.fecha_creacion);
      
      // Convertir ambas fechas a la misma zona horaria (UTC)
      const fechaEventoUTC = fechaEvento.getTime();
      const fechaCreacionUTC = fechaCreacion.getTime();

      console.log('Fecha evento UTC:', fechaEventoUTC);
      console.log('Fecha creación UTC:', fechaCreacionUTC);
      console.log('Diferencia en minutos:', (fechaCreacionUTC - fechaEventoUTC) / (1000 * 60));

      // Mostramos las notificaciones que fueron creadas hasta 60 minutos antes del evento
      const diferenciaEnMinutos = (fechaEventoUTC - fechaCreacionUTC) / (1000 * 60);
      return diferenciaEnMinutos >= 0 && diferenciaEnMinutos <= 60;
    }
    
    return false;
  });

  console.log("Notificaciones filtradas:", notificacionesFiltradas);

  return notificacionesFiltradas;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});