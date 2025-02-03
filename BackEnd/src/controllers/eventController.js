const supabase = require('../config/supabase');
const { actualizarInsigniaCrear } = require('../controllers/insigniaController');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//APUNTE. Más adelante estaría bien solo obtener los eventos que no han ocurrido ya. 

exports.crearEventos = async (req, res) => {
    try {
        const { userID, nombre, descripcion, tematica, ubicacion, aforo, fecha, duracion, latitud, longitud } = req.body;
        const foto = req.file; // La imagen cargada
  
        const camposFaltantes = [];

        if(!userID)camposFaltantes.push('userID');
        if(!nombre)camposFaltantes.push('nombre');
        if(!descripcion)camposFaltantes.push('descripcion');
        if(!tematica)camposFaltantes.push('tematica');
        if(!ubicacion)camposFaltantes.push('ubicacion');
        if(!aforo)camposFaltantes.push('aforo');
        if(!fecha)camposFaltantes.push('fecha');
        if(!duracion)camposFaltantes.push('duracion');
        if(!latitud)camposFaltantes.push('latitud');
        if(!longitud)camposFaltantes.push('longitud');

        if (camposFaltantes.length > 0) {
            return res.status(400).json({
              message: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}`
            });
        }

  
        let fotoURL = null;
        if (foto) {
            if (!foto.buffer) {
                return res.status(400).json({ message: 'No se recibió la imagen' });
            }

            const fileName = `${uuidv4()}_${foto.originalname}`; // Nombre único para la imagen
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('event-image')
                .upload(fileName, foto.buffer);  // Subir imagen a Supabase
  
            if (uploadError) {
                return res.status(500).json({ message: 'Error al subir la imagen', error: uploadError });
            }
  
            // Obtener la URL pública de la imagen
            const { data: publicUrlData, error: publicUrlError } = supabase
                .storage
                .from('event-image')
                .getPublicUrl(fileName);  // Obtener URL pública de la imagen
  
            if (publicUrlError) {
                return res.status(500).json({ message: 'Error al obtener la URL de la imagen', error: publicUrlError });
            }
  
            if (!publicUrlData.publicUrl) {
                return res.status(500).json({ message: 'No se ha conseguido la URL pública de la imagen' });
            }
  
            fotoURL = publicUrlData.publicUrl;  // Asigna la URL pública correctamente
        }
  
        // Insertar el evento en la base de datos
        const { data, error } = await supabase
            .from('eventos')
            .insert([
                {
                    userID,
                    nombre,
                    descripcion,
                    tematica,
                    ubicacion,
                    aforo,
                    fecha,
                    duracion,
                    foto: fotoURL,
                    latitud,
                    longitud
                }
            ]);
  
        if (error) {
            return res.status(500).json({ message: 'Error al crear el evento', error });
        }

        await actualizarInsigniaCrear(userID, tematica);
  
        return res.status(201).json({ message: 'Evento creado con éxito', data });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: 'Error del servidor(Evento)', error:error.message });
    }
};


exports.obtenerEventos = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*');
  
      if (error) {
        return res.status(500).json({ message: 'Error al obtener los eventos', error });
      }
      return res.status(200).json({message: 'Los eventos se deberían de enviar bien', data});
    }catch(error){
        return res.status(500).json({ message: 'Error del servidor', error });
    };
};

exports.eliminarEvento = async (req, res) => {
    const { id } = req.params;

    console.log('El id recibido es: ', id);

    try {

        const {data: dataInsc, error: errorInsc} = await supabase
            .from('inscripciones')
            .delete()
            .eq('eventID', id);

        if(errorInsc){
            console.error('Error al eliminar la inscripción:', errorInsc);
            return res.status(400).json({message: 'La inscripción no ha sido encontrada'});
        }

        const { data, error } = await supabase
            .from('eventos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar el evento:', error);
            return res.status(400).json({ error: error.message, id });
        }

        return res.status(200).json({ message: 'Evento eliminado exitosamente' });
    } catch (err) {
        console.error('Error en el servidor:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};


exports.inscribirAEvento = async (req, res) => {
    const { eventID, userID } = req.body;

    // Verificar que ambos valores están definidos
    if (!eventID || !userID) {
        return res.status(400).json({ message: 'Falta eventID o userID en la petición' });
    }

    try {
        // Obtener el evento específico
        const { data: eventoData, error: fetchError } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', eventID)
            .single();

        if (fetchError) {
            return res.status(400).json({ error: fetchError.message });
        }

        if (!eventoData) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        // Verificar si el usuario ya está inscrito en el evento
        const { data: existingInscription, error: checkError } = await supabase
            .from('inscripciones')
            .select('*')
            .eq('eventID', eventID)
            .eq('userID', userID)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            return res.status(400).json({ error: checkError.message });
        }

        if (existingInscription) {
            return res.status(400).json({ message: 'El usuario ya está inscrito en este evento' });
        }

        // Comprobar aforo y realizar inscripción
        if (eventoData.inscritos < eventoData.aforo) {
            const fecha_inscripcion = new Date();
            const { data: inscripcionData, error: inscripcionError } = await supabase
                .from('inscripciones')
                .insert({ eventID, userID, fecha_inscripcion});

            if (inscripcionError) {
                return res.status(400).json({ message: 'Error al crear la inscripción al evento', error: inscripcionError });
            }

         // Actualizar el número de inscritos
        const { data: updateData, error: updateError } = await supabase
            .from('eventos')
            .update({ inscritos: eventoData.inscritos + 1 })
            .eq('id', eventID);

            if (updateError) {
                return res.status(400).json({ error: updateError.message });
            }

            try{

            }catch(badgeError){}

            return res.status(200).json({ message: 'Inscripción exitosa' });
        } else {
            return res.status(400).json({ message: 'Aforo completo' });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Error de servidor', error: error.message });
    }
};

exports.obtenerEventosPorAutor = async (req, res) => {
    const { userID } = req.params;

    try {
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('userID', userID);

        if (error) {
            return res.status(500).json({ message: 'Error al obtener los eventos', error });
        }

        return res.status(200).json({ message: 'Eventos obtenidos exitosamente', data });
    } catch (error) {
        return res.status(500).json({ message: 'Error del servidor', error });
    }
};

async function obtenerInscripciones (req, res) {
    const { userID } = req.params;
    const {data, error } = await supabase 
        .from('inscripciones')
        .select('eventID')
        .eq('userID', userID)
    if (error) {
        throw new Error(`Error al obtener los eventos: ${error} `);
    }
    if (!data) {
        throw new Error('No se encontraron inscripciones del usuario');
    }
    return data;
}


exports.obtenerEventosInscrito = async (req, res) => {
    const { userID } = req.params;

    try {
        // Obtener las inscripciones del usuario
        const inscripciones = await obtenerInscripciones(req, res);

        // Obtener los IDs de los eventos a los que el usuario está inscrito
        const eventIDs = inscripciones.map(inscripcion => inscripcion.eventID);

        // Obtener los eventos correspondientes a los IDs
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select('*')
            .in('id', eventIDs);

        if (error) {
            return res.status(500).json({ message: 'Error al obtener los eventos inscritos', error });
        }

        return res.status(200).json({ message: 'Eventos inscritos obtenidos exitosamente', data: eventos });
    } catch (error) {
        return res.status(500).json({ message: 'Error del servidor', error });
    }
};
// Las funciones de abajo son para obtener eventos filtrados
// Función para obtener las preferencias del usuario
// No borrar esta funcion. La funcion export.obtenerEventos no sirve
async function obtenerPreferencias(userID) {
    const { data, error } = await supabase
        .from('preferencias')
        .select('*')
        .eq('userID', userID)
        .single();

    if (error) {
        throw new Error(`No se pudieron obtener las preferencias del usuario: ${error.message}`);
    }

    if (!data) {
        throw new Error('No se encontraron preferencias para el usuario');
    }
    return data;
}

// Función para obtener los eventos
// No borrar esta funcion. La funcion export.obtenerEventos no sirve
async function obtenerEventos() {
    const { data, error } = await supabase
        .from('eventos')
        .select('*'); // Solo eventos futuros

    if (error) {
        throw new Error(`Error al obtener los eventos: ${error.message}`);
    }

    return data;
}
// Función para filtrar los eventos según las preferencias del usuario
// Si el evento cumple con alguna preferencia, se anyade a filtrados
function filtrarEventos(eventos, preferencias) {
    return eventos.filter(evento => {
        
        const tematicaMatch = preferencias[evento.tematica] || false;
        console.log("LLEGA AQUÍ");
        console.log(preferencias[evento.tematica]);
        const ubicacionMatch = preferencias[evento.ubicacion] || false;

        // Extraer la hora del evento y compararla con las preferencias del usuario
        const horaEvento = new Date(evento.fecha).getHours();
        const horaMatch = preferencias[`${horaEvento}:00`] || false;

        return tematicaMatch || ubicacionMatch || horaMatch;
    });
}

// Función para manejar errores y enviar una respuesta adecuada
function manejarError(res, message, error) {
    console.error(message, error);
    return res.status(500).json({ message, error });
}

// Esta es la funcion PADRE de filtrar eventos
// Función principal para obtener los eventos filtrados
exports.obtenerEventosFiltrados = async (req, res) => {
    const { userID } = req.params;
    console.log('Obteniendo eventos filtrados para el usuario:', userID);
    try {
        // 1. Obtener las preferencias del usuario
        const preferenciasData = await obtenerPreferencias(userID);
        console.log('Preferencias obtenidas:', preferenciasData);
        // 2. Obtener los eventos futuros
        const eventosData = await obtenerEventos();
        console.log('Eventos obtenidos:', eventosData);
        // 3. Filtrar los eventos según las preferencias
        const eventosFiltrados = filtrarEventos(eventosData, preferenciasData);
        console.log('Eventos filtrados:', eventosFiltrados);
        // 4. Responder con los eventos filtrados
        return res.status(200).json({
            message: 'Eventos filtrados obtenidos exitosamente',
            eventos: eventosFiltrados
        });

    } catch (error) {
        // Manejo de errores
        return manejarError(res, 'Error al obtener eventos filtrados', error);
    }

};

exports.obtenerPosteriores = async (req,res) => {
    try {
        // Obtener la fecha y hora actual en formato UTC (ISO 8601)
        const fechaActual = new Date().toISOString();
    
        const { data, error } = await supabase
          .from('eventos') // Nombre de la tabla
          .select('*') // Selecciona todas las columnas
          .gte('fecha', fechaActual) // Filtra los eventos con fecha mayor o igual a la fecha actual
          .order('fecha', { ascending: true }); // Ordena los eventos por fecha ascendente
    
        if (error) {
          console.log("El error es: " + error)
        }
    
        return res.status(200).json(data); // Devuelve los eventos filtrados
      } catch (error) {
        console.error('Error al obtener eventos:', error.message);
        return res.status(500).json({ message: 'Error al obtener los eventos' });
      }
};
