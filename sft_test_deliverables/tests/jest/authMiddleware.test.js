
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

const { authMiddleware } = require('../../server'); // will require server.js which exports authMiddleware

describe('authMiddleware', () => {
  const req = { headers: {} }, res = { status: jest.fn(()=>res), json: jest.fn() }, next = jest.fn();
  beforeEach(()=>{ jest.clearAllMocks(); });

  test('rejects when no auth header', async () => {
    await authMiddleware(req,res,next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  test('rejects when token invalid', async () => {
    req.headers.authorization = 'Bearer badtoken';
    jwt.verify.mockImplementation(()=>{ throw new Error('invalid'); });
    await authMiddleware(req,res,next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('accepts valid token and attaches user', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    jwt.verify.mockReturnValue({ id: 123 });
    await authMiddleware(req,res,next);
    expect(req.user).toEqual({ id: 123 });
    expect(next).toHaveBeenCalled();
  });
});
