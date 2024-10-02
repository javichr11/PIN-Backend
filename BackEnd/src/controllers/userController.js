const supabase = require('../config/supabase');

exports.registrarUsuario = async (req, res) => {

  console.log("Recibido...")

  const { nombre, edad } = req.body;

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, edad }]);

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
