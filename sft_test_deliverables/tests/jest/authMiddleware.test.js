const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

// caminho CORRETÍSSIMO a partir do teste
const authMiddleware = require('../../../middleware/auth');

describe('authMiddleware', () => {
  const req = { headers: {} };
  const res = { 
    status: jest.fn(() => res), 
    json: jest.fn() 
  };
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects when no auth header', async () => {
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  test('rejects when token invalid', async () => {
    req.headers.authorization = 'Bearer invalid';
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('accepts valid token and attaches user', async () => {
    req.headers.authorization = 'Bearer valid';
    jwt.verify.mockReturnValue({ id_usuario: 123 });

    await authMiddleware(req, res, next);
    expect(req.user).toEqual({ id_usuario: 123 });
    expect(next).toHaveBeenCalled();
  });
});
