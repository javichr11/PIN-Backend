const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, edad, password, nombre_usuario, movil } = req.body;
    const foto = req.file;

    // Comprobar si faltan datos obligatorios
    if (!nombre || !edad || !password || !nombre_usuario || !movil) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Verificar si el número de teléfono ya está registrado
    const { data: existingUserByPhone, error: phoneCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('movil', movil)
      .single(); // Obtiene un solo resultado

    if (phoneCheckError && phoneCheckError.code !== 'PGRST116') { // PGRST116 indica que no se encontró ningún resultado
      return res.status(500).json({ message: 'Error al verificar el número de teléfono', error: phoneCheckError });
    }

    if (existingUserByPhone) {
      return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
    }

    // Verificar si el nombre de usuario ya está registrado
    const { data: existingUserByUsername, error: usernameCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre_usuario', nombre_usuario)
      .single(); // Obtiene un solo resultado

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') { // PGRST116 indica que no se encontró ningún resultado
      return res.status(500).json({ message: 'Error al verificar el nombre de usuario', error: usernameCheckError });
    }

    if (existingUserByUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está registrado' });
    }

    let fotoURL = null;
    if (foto) {
      if (!foto.buffer) {
        return res.status(400).json({ message: 'No se recibió la imagen' });
      }

      const fileName = `${uuidv4()}_${foto.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('user-post-images')
        .upload(fileName, foto.buffer); // Subir imagen a Supabase

      if (uploadError) {
        console.error('Error al subir la imagen:', uploadError.message);
        return res.status(500).json({ message: 'Error al subir la imagen', error: uploadError });
      }

      // Obtener la URL pública de la imagen
      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('user-post-images')
        .getPublicUrl(fileName); // Obtener URL pública de la imagen

      if (publicUrlError) {
        return res.status(500).json({ message: 'Error al obtener la URL de la imagen', error: publicUrlError });
      }

      if (!publicUrlData.publicUrl) {
        return res.status(500).json({ message: 'No se ha conseguido la URL pública de la imagen' });
      }

      fotoURL = publicUrlData.publicUrl; // Asigna la URL pública correctamente
    }

    // Registrar al nuevo usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre,
        edad,
        password,
        foto: fotoURL,
        nombre_usuario,
        movil
      }]);

    if (error) {
      return res.status(500).json({ message: 'Error al crear el usuario', error });
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', data });
  } catch (error) {
    return res.status(500).json({ message: 'Error del servidor', error });
  }
};




exports.obtenerUsuarios = async (req, res) => {

     console.log("Recibido...")

    const { data, error } = await supabase
      .from('usuarios')
      .select('*');
  
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  
    res.status(200).json(data);
  };
