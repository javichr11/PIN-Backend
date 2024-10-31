const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.crearEventos = async (req, res) => {
    try {
        const { usuario_id, nombre, descripcion, tematica, ubicacion, aforo, fecha, duracion } = req.body;
        const foto = req.file; // La imagen cargada
  
        // Verificación de datos obligatorios
        if (!usuario_id || !nombre || !fecha || !ubicacion || !aforo || !tematica) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
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
                console.error('Error al subir la imagen:', uploadError.message);
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
                    usuario_id,
                    nombre,
                    descripcion,
                    tematica,
                    ubicacion,
                    aforo,
                    fecha,
                    duracion,
                    foto: fotoURL
                }
            ]);
  
        if (error) {
            return res.status(500).json({ message: 'Error al crear el evento', error });
        }
  
        return res.status(201).json({ message: 'Evento creado con éxito', data });
    } catch (error) {
        return res.status(500).json({ message: 'Error del servidor', error });
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
    }
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

    try {
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

        const { data: existingInscription, error: checkError } = await supabase
            .from('inscripciones')
            .select('*')
            .eq('eventID', eventID)
            .eq('userID', userID)
            .single();

        if (checkError) {
            return res.status(400).json({ error: checkError.message });
        }

        if (existingInscription) {
            return res.status(400).json({ message: 'El usuario ya está inscrito en este evento' });
        }

        if (eventoData.inscritos < eventoData.aforo) {
            const { data: updateData, error: updateError } = await supabase
                .from('eventos')
                .update({ inscritos: eventoData.inscritos + 1 })
                .eq('id', eventID);

            if (updateError) {
                return res.status(400).json({ error: updateError.message });
            }

            const { data: inscripcionData, error: inscripcionError } = await supabase
                .from('inscripciones')
                .insert({ eventID, userID });

            if (inscripcionError) {
                return res.status(400).json({ message: 'Error al crear la inscripción al evento', error: inscripcionError });
            }

            return res.status(200).json({ message: 'Inscripción exitosa' });
        } else {
            return res.status(400).json({ message: 'Aforo completo' });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Error de servidor', error: error.message });
    }
};

