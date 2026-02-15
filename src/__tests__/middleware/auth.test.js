// src/__tests__/middleware/auth.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
    sign: jest.fn().mockReturnValue('signed-token'),
  },
}));

jest.unstable_mockModule('crypto', () => ({
  default: { randomUUID: jest.fn().mockReturnValue('test-uuid') },
}));

jest.unstable_mockModule('../../config/app.js', () => ({
  default: {
    // pragma: allowlist secret
    jwt: { secret: 'test-secret', algorithm: 'HS256', expiration: 3600 },
  },
}));

const mockIsDenylisted = jest.fn().mockResolvedValue(false);
const mockFindByPk = jest.fn();

jest.unstable_mockModule('../../models/index.js', () => ({
  User: { findByPk: mockFindByPk },
  JwtDenylist: { isDenylisted: mockIsDenylisted },
}));

const jwt = (await import('jsonwebtoken')).default;
const { authenticate, optionalAuth, generateToken } = await import('../../middleware/auth.js');

describe('authenticate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if no Authorization header', async () => {
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: { code: 401, message: 'Authentication required' } }),
    );
  });

  it('should return 401 if header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic abc';
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 if token is expired', async () => {
    req.headers.authorization = 'Bearer expired-token';
    jwt.verify.mockImplementation(() => {
      const err = new Error('expired');
      err.name = 'TokenExpiredError';
      throw err;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: { code: 401, message: 'Token has expired' } }),
    );
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer bad-token';
    jwt.verify.mockImplementation(() => {
      const err = new Error('invalid');
      err.name = 'JsonWebTokenError';
      throw err;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: { code: 401, message: 'Invalid token' } }),
    );
  });

  it('should return 401 if token is denylisted', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ sub: 1, jti: 'revoked-jti' });
    mockIsDenylisted.mockResolvedValue(true);
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: { code: 401, message: 'Token has been revoked' } }),
    );
  });

  it('should return 401 if user not found', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ sub: 999, jti: 'good-jti' });
    mockIsDenylisted.mockResolvedValue(false);
    mockFindByPk.mockResolvedValue(null);
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: { code: 401, message: 'User not found' } }),
    );
  });

  it('should set req.user and call next on success', async () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ sub: 1, jti: 'good-jti' });
    mockIsDenylisted.mockResolvedValue(false);
    mockFindByPk.mockResolvedValue(mockUser);
    await authenticate(req, res, next);
    expect(req.user).toBe(mockUser);
    expect(req.jwtPayload).toEqual({ sub: 1, jti: 'good-jti' });
    expect(next).toHaveBeenCalled();
  });

  it('should call next(error) for unexpected errors', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const unexpectedError = new Error('DB down');
    jwt.verify.mockImplementation(() => {
      throw unexpectedError;
    });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(unexpectedError);
  });
});

describe('optionalAuth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('should call next without user if no header', async () => {
    await optionalAuth(req, res, next);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set user if valid token', async () => {
    const mockUser = { id: 1 };
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ sub: 1 });
    mockFindByPk.mockResolvedValue(mockUser);
    await optionalAuth(req, res, next);
    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should continue without user if token invalid', async () => {
    req.headers.authorization = 'Bearer bad-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('bad');
    });
    await optionalAuth(req, res, next);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});

describe('generateToken', () => {
  it('should return token and jti', () => {
    const user = {
      id: 1,
      jwtPayload: () => ({ role: 'customer', email: 'a@b.com', scopes: [] }),
    };
    const result = generateToken(user);
    expect(result.token).toBe('signed-token');
    expect(result.jti).toBe('test-uuid');
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, jti: 'test-uuid', role: 'customer' }),
      'test-secret',
      expect.objectContaining({ algorithm: 'HS256', expiresIn: 3600 }),
    );
  });
});
