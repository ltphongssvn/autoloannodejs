// src/__tests__/controllers/auth/registrations.test.js
import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockFindOne = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  User: { create: mockCreate, findOne: mockFindOne },
  SecurityAuditLog: { logEvent: jest.fn() },
}));

jest.unstable_mockModule('../../../middleware/auth.js', () => ({
  generateToken: jest.fn().mockReturnValue({ token: 'jwt-token', jti: 'jti-123' }), // pragma: allowlist secret
}));

const { register } = await import('../../../controllers/auth/registrations.js');

describe('Registration Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: 'test@example.com',
        password: 'Password1!', // pragma: allowlist secret
        first_name: 'John',
        last_name: 'Doe',
      },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  it('should register a new user and return token', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      roleName: () => 'customer',
    });
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.objectContaining({ code: 201 }),
      }),
    );
    expect(res.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer jwt-token');
  });

  it('should return 409 if email already exists', async () => {
    mockFindOne.mockResolvedValue({ id: 1 });
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('should return 422 if required fields missing', async () => {
    req.body = {};
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should return 422 if password too short', async () => {
    req.body.password = '12345'; // pragma: allowlist secret
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should call next on unexpected error', async () => {
    mockFindOne.mockRejectedValue(new Error('DB down'));
    await register(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
