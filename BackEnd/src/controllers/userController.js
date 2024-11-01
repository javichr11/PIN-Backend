const supabase = require('../config/supabase');

exports.registrarUsuario = async (req, res) => {
  console.log("Recibido...");

  const { nombre, edad, password, movil, nombre_usuario } = req.body;

  // Verificar que el número de teléfono sea único
  const { data: existingUserByPhone, error: findErrorByPhone } = await supabase
    .from('usuarios')
    .select('*')
    .eq('movil', movil)
    .single();

  if (findErrorByPhone && findErrorByPhone.code !== 'PGRST116') { // PGRST116 indica que no se encontraron resultados
    return res.status(500).json({ error: "Error al verificar el número de teléfono" });
  }

  // Si el número ya está registrado, devuelve un error
  if (existingUserByPhone) {
    return res.status(400).json({ error: "El número de teléfono ya está registrado" });
  }

  // Verificar que el nombre de usuario (nickname) sea único
  const { data: existingUserByNickname, error: findErrorByNickname } = await supabase
    .from('usuarios')
    .select('*')
    .eq('nombre_usuario', nombre_usuario)
    .single();

  if (findErrorByNickname && findErrorByNickname.code !== 'PGRST116') { // PGRST116 indica que no se encontraron resultados
    return res.status(500).json({ error: "Error al verificar el nombre de usuario" });
  }

  // Si el nickname ya está registrado, devuelve un error
  if (existingUserByNickname) {
    return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
  }

  // Registrar al usuario si el número y el nombre de usuario son únicos
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, edad, password, movil, nombre_usuario }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Usuario registrado con éxito', data });
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
