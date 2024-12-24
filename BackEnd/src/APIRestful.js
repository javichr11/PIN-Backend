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

async function enviarNotificacion(token, message) {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: message.title,
        body: message.body,
      }),
    });

    const data = await response.json();
    if (data.status !== 'ok') {
      console.error('Error al enviar notificación:', data);
    }
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}


//PROGRAMACIÓN DE LAS NOTIFICACIONES

cron.schedule('* * * * *', async () => {
  console.log('Ejecutando tarea programada para enviar notificaciones...');

      try {
          // Lógica para buscar eventos próximos y enviar notificaciones
          const { data: eventos, error } = await supabase
        .from('eventos')
        .select(`
            id,
            nombre,
            fecha,
            inscripciones(userID)
        `)
        .gte('fecha', new Date().toISOString())
        .lt('fecha', new Date(Date.now() + 3600000).toISOString());

    if (error) throw error;

    if (eventos.length > 0) {
        for (const evento of eventos) {
            // Iterar sobre las inscripciones del evento
            for (const inscripcion of evento.inscripciones) {
                const { data: usuario, error: errorUsuario } = await supabase
                    .from('usuarios')
                    .select('token')
                    .eq('id', inscripcion.userID)
                    .single();

                if (errorUsuario) {
                    console.error(`Error obteniendo usuario con ID ${inscripcion.userID}:`, errorUsuario);
                    continue;
                }

                if (usuario.token) {
                    // Enviar notificación al usuario
                    await enviarNotificacion(usuario.token, {
                        title: '¡Tu evento está por comenzar!',
                        body: `El evento "${evento.nombre}" comienza en menos de una hora.`,
                    });
                }
            }
        }
    }
  } catch (err) {
      console.error('Error en la tarea programada:', err);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});