const { registrarUsuario } = require('../src/controllers/userController'); // Asegúrate de poner la ruta correcta
const supabase = require('../src/config/supabase'); // Asegúrate de importar Supabase correctamente
const { v4: uuidv4 } = require('uuid');

// Mock para Supabase
jest.mock('../src/config/supabase.js', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upload: jest.fn().mockReturnThis(),
      getPublicUrl: jest.fn().mockReturnThis(),
    };
    return {
      storage: { from: jest.fn(() => mockSupabase) },
      from: jest.fn(() => mockSupabase),
    };
  });

describe('Test de registrarUsuario', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nombre: 'Juan',
        edad: 30,
        password: 'password123',
        nombre_usuario: 'juan123',
        movil: '1234567890'
      },
        buffer: Buffer.from('test image'),
        originalname: 'test.jpg'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('Debe registrar un usuario correctamente', async () => {

        supabase.storage.from().upload.mockResolvedValue({ data: { path: 'test-path' } });
        supabase.storage.from().getPublicUrl.mockReturnValue({ 
        data: { publicUrl: 'http://test-url.com/image.jpg' }
      });

      supabase.from().insert.mockResolvedValue({ 
        data: [{ ...req.body, foto: 'http://test-url.com/image.jpg' }],
        error: null 
      });

      await registrarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debería fallar si los campos no están rellenados', async () => {
    req.body.edad = undefined;

    await registrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
}); 
 /*****************************************AQUÍ TERMINAN LAS PRUEBAS REGISTRAR USUARIOS************************************************** */