// src/__tests__/controllers/auth/passwords.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();

jest.unstable_mockModule('../../../models/index.js', () => ({
  User: { findByPk: mockFindByPk },
  SecurityAuditLog: { logEvent: jest.fn() },
}));

const { changePassword } = await import('../../../controllers/auth/passwords.js');

describe('Password Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1 },
      body: {
        current_password: 'OldPass1!', // pragma: allowlist secret
        new_password: 'NewPass1!', // pragma: allowlist secret
      },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('agent'),
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should change password', async () => {
    const mockUser = {
      id: 1,
      validPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
    };
    mockFindByPk.mockResolvedValue(mockUser);
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUser.encrypted_password).toBe('NewPass1!');
  });

  it('should return 422 if fields missing', async () => {
    req.body = {};
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should return 401 if current password wrong', async () => {
    const mockUser = { id: 1, validPassword: jest.fn().mockResolvedValue(false) };
    mockFindByPk.mockResolvedValue(mockUser);
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 422 if new password too short', async () => {
    req.body.new_password = '12345'; // pragma: allowlist secret
    const mockUser = { id: 1, validPassword: jest.fn().mockResolvedValue(true) };
    mockFindByPk.mockResolvedValue(mockUser);
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});
