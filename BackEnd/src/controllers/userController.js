const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, edad, password, nombre_usuario, movil } = req.body;
    const foto = req.file;

    const camposFaltantes = [];
      if (!nombre) camposFaltantes.push('nombre');
      if (!edad) camposFaltantes.push('edad');
      if (!password) camposFaltantes.push('password');
      if (!nombre_usuario) camposFaltantes.push('nombre_usuario');
      if (!movil) camposFaltantes.push('movil');

      // Si hay campos faltantes, devolver un error
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          message: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}`
        });
      }

    const { data: existingUserByPhone, error: phoneCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('movil', movil)
      .single();

    if (phoneCheckError && phoneCheckError.code !== 'PGRST116') { // PGRST116 indica que no se encontró ningún resultado
      return res.status(500).json({ message: 'Error al verificar el número de teléfono', error: phoneCheckError });
    }

    if (existingUserByPhone) {
      return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
    }

    const { data: existingUserByUsername, error: usernameCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre_usuario', nombre_usuario)
      .single();

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
        .upload(fileName, foto.buffer);

      if (uploadError) {
        console.error('Error al subir la imagen:', uploadError.message);
        return res.status(500).json({ message: 'Error al subir la imagen', error: uploadError });
      }

      // Obtener la URL pública de la imagen
      const { data: publicUrlData, error: publicUrlError } = await supabase
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
    const { data, errorRegistro } = await supabase
      .from('usuarios')
      .insert([{
        nombre,
        edad,
        password,
        foto: fotoURL,
        nombre_usuario,
        movil
      }
    ])
    .select();

    if (errorRegistro) {
      return res.status(500).json({ message: 'Error al crear el usuario', errorRegistro});
    }

  if(data){
    console.log(data);
    const [user] = data;

    return res.status(200).json({
      message: "¡Registro de usuario realizado correctamente!",
      user: {
        id: user.id,
        nombre: user.nombre,
        nombre_usuario: user.nombre_usuario,
        movil: user.movil,
        foto: user.foto,
        edad: user.edad,
      },
    });
  }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
};


exports.iniciarSesion = async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;

    // Validar que ambos campos estén presentes
    if (!nombre_usuario || !password) {
      return res.status(400).json({
        message: "Debe proporcionar nombre de usuario o móvil y contraseña.",
      });
    }

    let user = null;

    // Intentar buscar al usuario por nombre de usuario
    const { data: userByUsername, error: usernameError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("nombre_usuario", nombre_usuario)
      .single();

    if (!userByUsername && usernameError?.code !== "PGRST116") {
      // Si ocurre un error inesperado al buscar por nombre de usuario
      return res.status(500).json({ message: "Error al buscar el usuario.", error: usernameError });
    }

    // Si no se encuentra por nombre de usuario, buscar por móvil
    if (!userByUsername) {
      const { data: userByPhone, error: phoneError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("movil", nombre_usuario) // Usar el mismo campo `nombre_usuario` para móvil
        .single();

      if (!userByPhone && phoneError?.code !== "PGRST116") {
        // Si ocurre un error inesperado al buscar por móvil
        return res.status(500).json({ message: "Error al buscar el usuario por móvil.", error: phoneError });
      }

      user = userByPhone;
    } else {
      user = userByUsername;
    }

    // Si no se encontró el usuario por ninguno de los métodos
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si la contraseña es correcta
    if (user.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Si las credenciales son válidas, retornar éxito
    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.id,
        nombre: user.nombre,
        nombre_usuario: user.nombre_usuario,
        movil: user.movil,
        foto: user.foto,
        edad: user.edad,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error del servidor.", error });
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
  exports.registrarPreferencias = async(req, res) => {

    const { userID, ...preferencias } = req.body;

    if (!userID) {
      return res.status(400).json({ error: "El userID es obligatorio." });
    }

    console.log(`Recibiendo preferencias de usuario: ${preferencias}`);

    try{

      const { data: insertData, error: insertError } = await supabase
      .from('preferencias')
      .insert({ userID })
      .select('id');

      if (insertError) {
        console.error("Error al insertar la fila inicial:", insertError);
        return res.status(400).json({ error: insertError.message });
      }
      const newId = insertData[0].id;

      const updates = {};
      Object.entries(preferencias).forEach(([key, value]) => {
      if (value === true) {
        updates[key] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      // Actualizar solo las columnas necesarias
      const { error: updateError } = await supabase
        .from('preferencias')
        .update(updates)
        .eq('id', newId);

      if (updateError) {
        console.error("Error al actualizar las columnas seleccionadas:", updateError);
        return res.status(400).json({ error: updateError.message });
      }
    }

    res.status(200).json({ message: "Preferencias guardadas correctamente." });


    } catch(error){
      console.error("Error al guardar las preferencias:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
