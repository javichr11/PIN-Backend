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
<<<<<<< HEAD
<<<<<<< Updated upstream
          const fileName = `${uuidv4()}_${foto.originalname}`; // Nombre único para la imagen
          const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('event-image')
              .upload(fileName, foto.buffer);  // Subir imagen a Supabase

          if (uploadError) {
              return res.status(500).json({ message: 'Error al subir la imagen', error: uploadError });
          }

          const { publicURL, error: publicUrlError } = supabase
              .storage
              .from('event-image')
              .getPublicUrl(fileName);  // Obtener URL pública de la imagen

          if (publicUrlError) {
              return res.status(500).json({ message: 'Error al obtener la URL de la imagen', error: publicUrlError });
          }

          fotoURL = publicURL.publicURL;
=======
=======
>>>>>>> main
        const fileName = `${uuidv4()}_${foto.originalname}`; // Nombre único para la imagen
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('event-image')
          .upload(fileName, foto.buffer);  // Subir imagen a Supabase
  
        if (uploadError) {
          console.error('Error al subir la imagen:', uploadError);
          return res.status(500).json({ message: 'Error al subir la imagen', error: uploadError });
        }
<<<<<<< HEAD
        console.log('Datos de carga:', uploadData);
=======
>>>>>>> main
  
        const { data: { publicURL }, error: publicUrlError } = supabase
        .storage
        .from('event-image')
        .getPublicUrl(fileName);  // Obtener URL pública de la imagen
      
      if (publicUrlError) {
        console.error('Error al obtener la URL pública:', publicUrlError);
        return res.status(500).json({ message: 'Error al obtener la URL de la imagen', error: publicUrlError });
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> main
      }
      
      if (!publicURL) {
        return res.status(500).json({ message: 'No se pudo obtener la URL pública de la imagen' });
      }
  
        fotoURL = publicURL.publicURL;
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
        console.error('Error al crear el evento:', error);
        return res.status(500).json({ message: 'Error al crear el evento', error });
      }
  
      return res.status(201).json({ message: 'Evento creado con éxito', data });
    } catch (error) {
      console.error('Error del servidor:', error);
      return res.status(500).json({ message: 'Error del servidor', error: error.message });
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
        // Devolver la lista de eventos
        return res.status(200).json({ message: 'Eventos obtenidos con éxito', data });
      } catch (error) {
        return res.status(500).json({ message: 'Error del servidor', error });
      }
  };

  exports.eliminarEvento = async (req, res) => {
    const {id} = req.body;
    try{

        if(!id){
            return res.status(400).json({ message: 'Se requiere el ID del evento para eliminarlo' });
        }

        const {data, error} = await supabase
        .from('evento')
        .delete()
        .eq('id', id);

        if(error){
            return res.status(500).json({ message: 'Error al eliminar el evento', error });
        }else{
            return res.status(200).json({ message: 'Evento eliminado con éxito', data });
        }


    }catch(error){
        return res.status(500).json({message: 'Error del servidor', error})
    }
  }
