// src/__tests__/controllers/auth/sessions.test.js
import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockLogEvent = jest.fn();
const mockAddToList = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  User: { findOne: mockFindOne },
  SecurityAuditLog: { logEvent: mockLogEvent },
  JwtDenylist: { addToList: mockAddToList },
}));

jest.unstable_mockModule('../../../middleware/auth.js', () => ({
  generateToken: jest.fn().mockReturnValue({ token: 'jwt-token', jti: 'jti-123' }), // pragma: allowlist secret
}));

const { login, logout } = await import('../../../controllers/auth/sessions.js');

describe('Sessions Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: { email: 'test@example.com', password: 'Password1!' }, // pragma: allowlist secret
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
      user: null,
      jwtPayload: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roleName: () => 'customer',
        first_name: 'John',
        last_name: 'Doe',
        validPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        sign_in_count: 0,
        current_sign_in_at: null,
        last_sign_in_at: null,
        current_sign_in_ip: null,
        last_sign_in_ip: null,
        locked_at: null,
        otp_required_for_login: false,
      };
      mockFindOne.mockResolvedValue(mockUser);
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer jwt-token');
    });

    it('should return 422 if email or password missing', async () => {
      req.body = {};
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should return 401 if user not found', async () => {
      mockFindOne.mockResolvedValue(null);
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if password invalid', async () => {
      const mockUser = {
        id: 1,
        validPassword: jest.fn().mockResolvedValue(false),
        locked_at: null,
        otp_required_for_login: false,
      };
      mockFindOne.mockResolvedValue(mockUser);
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 423 if account is locked', async () => {
      const mockUser = {
        id: 1,
        locked_at: new Date(),
        validPassword: jest.fn().mockResolvedValue(true),
        otp_required_for_login: false,
      };
      mockFindOne.mockResolvedValue(mockUser);
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(423);
    });

    it('should call next on unexpected error', async () => {
      mockFindOne.mockRejectedValue(new Error('DB down'));
      await login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('logout', () => {
    it('should denylist token and return 200', async () => {
      req.user = { id: 1 };
      req.jwtPayload = { jti: 'jti-123', exp: 9999999999 };
      await logout(req, res, next);
      expect(mockAddToList).toHaveBeenCalledWith('jti-123', 9999999999);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      req.user = { id: 1 };
      req.jwtPayload = { jti: 'jti-123', exp: 9999999999 };
      mockAddToList.mockRejectedValue(new Error('fail'));
      await logout(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
