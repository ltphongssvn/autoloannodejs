// src/__tests__/controllers/users.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();
const mockFindAndCountAll = jest.fn();

jest.unstable_mockModule('../../models/index.js', () => ({
  User: { findByPk: mockFindByPk, findAndCountAll: mockFindAndCountAll },
}));

const { profile, updateProfile, listUsers } = await import('../../controllers/users.js');

describe('Users Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 1 }, params: {}, query: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('profile', () => {
    it('should return current user profile', async () => {
      mockFindByPk.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        first_name: 'John',
        last_name: 'Doe',
        roleName: () => 'customer',
        toJSON: () => ({ id: 1, email: 'test@test.com' }),
      });
      await profile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      await profile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateProfile', () => {
    it('should update user fields', async () => {
      const mockUser = {
        id: 1,
        first_name: 'John',
        save: jest.fn(),
        toJSON: () => ({ id: 1, first_name: 'Jane' }),
      };
      mockFindByPk.mockResolvedValue(mockUser);
      req.body = { first_name: 'Jane' };
      await updateProfile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      await updateProfile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('listUsers', () => {
    it('should return paginated users for staff', async () => {
      mockFindAndCountAll.mockResolvedValue({
        rows: [{ id: 1, toJSON: () => ({ id: 1 }) }],
        count: 1,
      });
      await listUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
