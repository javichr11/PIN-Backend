const { inscribirAEvento } = require('../src/controllers/eventController');
const supabase = require('../src/config/supabase');

// Mock supabase
jest.mock('../src/config/supabase.js', () => ({
    from: jest.fn()
}));

describe('Event Controller Tests', () => {
    describe('Inscribirse a evento', () => {
        let req;
        let res;
        let mockSelect;
        let mockEq;
        let mockSingle;
        
        beforeEach(() => {
            jest.clearAllMocks();
            
            // Setup mock chain
            mockSingle = jest.fn();
            mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
            mockSelect = jest.fn(() => ({ eq: mockEq }));
            const mockInsert = jest.fn();
            const mockUpdateEq = jest.fn(() => ({ eq: jest.fn() }));

            require('../src/config/supabase').from.mockImplementation((table) => {
                if (table === 'eventos') {
                    return { select: mockSelect, update: () => ({ eq: mockUpdateEq }) };
                } else if (table === 'inscripciones') {
                    return { select: mockSelect, insert: mockInsert };
                }
                return {};
            });

            req = {
                body: {
                    eventID: '123',
                    userID: '456'
                }
            };
    
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });

        test('Inscripción a evento exitosa', async () => {
            const mockEvento = {
                id: '123',
                inscritos: 5,
                aforo: 10
            };

            mockSingle
                .mockResolvedValueOnce({ data: mockEvento, error: null })
                .mockResolvedValueOnce({ data: null, error: null });

                const mockInsert = jest.fn().mockResolvedValueOnce({
                    data: { eventID: '123', userID: '456' },
                    error: null
                });
                
                const mockUpdateEq = jest.fn().mockResolvedValueOnce({
                    data: { inscritos: 6 },
                    error: null
                });

                require('../src/config/supabase').from.mockImplementation((table) => {
                    if (table === 'eventos') {
                        return { select: mockSelect, update: () => ({ eq: mockUpdateEq }) };
                    } else if (table === 'inscripciones') {
                        return { select: mockSelect, insert: mockInsert };
                    }
                    return {};
                });

                await inscribirAEvento(req, res);
            
                expect(res.status).toHaveBeenCalledWith(200);
        });

        test('Fallo cuando el usuario ya está inscrito', async () => {
            mockSingle
                .mockResolvedValueOnce({
                    data: { id: '123', inscritos: 5, aforo: 10 },
                    error: null
                })
                .mockResolvedValueOnce({
                    data: { eventID: '123', userID: '456' },
                    error: null
                });

            await inscribirAEvento(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
        });
        test('Fallo cuando el evento está completo', async () => {

            mockSingle.mockResolvedValueOnce({
                data: {
                    id: '123',
                    inscritos: 10, // Número de inscritos igual al aforo
                    aforo: 10
                },
                error: null
            });

            mockSingle.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116' }
            });

            await inscribirAEvento(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

        });
    });
});