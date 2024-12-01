const { crearEventos} = require('../src/controllers/eventController'); // Adjust path as needed
const supabase = require('../src/config/supabase');

// Mock supabase
jest.mock('../src/config/supabase.js', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    };
    return {
      storage: { from: jest.fn(() => mockSupabase) },
      from: jest.fn(() => mockSupabase),
    };
  });

describe('Event Controller Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Crear eventos', () => {
    beforeEach(() => {
      // Setup basic request object for crearEventos
      req = {
        body: {
          usuario_id: '123',
          nombre: 'Test Event',
          descripcion: 'Test Description',
          tematica: 'Test Theme',
          ubicacion: 'Test Location',
          aforo: 100,
          fecha: '2024-12-01',
          duracion: '2h'
        },
        file: {
          buffer: Buffer.from('test image'),
          originalname: 'test.jpg'
        }
      };
    });

    test('Debería crear un evento con imagen correctamente', async () => {
      // Mock successful image upload
      supabase.storage.from().upload.mockResolvedValue({ data: { path: 'test-path' } });
      supabase.storage.from().getPublicUrl.mockReturnValue({ 
        data: { publicUrl: 'http://test-url.com/image.jpg' }
      });

      // Mock successful event creation
      supabase.from().insert.mockResolvedValue({ 
        data: [{ ...req.body, foto: 'http://test-url.com/image.jpg' }],
        error: null 
      });

      await crearEventos(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Evento creado con éxito',
          data: expect.any(Array)
        })
      );
    });

    test('Debería fallar si los campos no están rellenados', async () => {
      req.body.nombre = undefined;

      await crearEventos(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Faltan datos obligatorios'
      });
    });
  });
});
  /*****************************************AQUÍ TERMINAN LAS PRUEBAS PARA CREAR EVENTOS************************************************** */



  