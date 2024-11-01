const supabase = require('../config/supabase');

const supabase = require('../config/supabase');

exports.registrarUsuario = async (req, res) => { 
  console.log("Recibido...");

  const { nombre, edad, movil } = req.body;

  // Verificar que el número de teléfono sea único
  const { data: existingUser, error: findError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('movil', movil)
    .single(); 

  if (findError) {
    return res.status(500).json({ error: "Error al verificar el número de teléfono" });
  }

  // Si el número ya está registrado, devuelve un error
  if (existingUser) {
    return res.status(400).json({ error: "El número de teléfono ya está registrado" });
  }

  // Registrar al usuario si el número es único
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, edad, movil }]);

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
