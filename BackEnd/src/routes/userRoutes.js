const express = require('../config/supabase');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('multer')({ storage: multer.memoryStorage() });

// Ruta para registrar un usuario
//router.post('/registrar', registrarUsuario);
router.post('/usuario/registrar', upload.single('foto'), userController.registrarUsuario);
// Ruta para obtener todos los usuarios
router.get('/obtener', userController.obtenerUsuarios);

module.exports = router;
