// src/__tests__/controllers/underwriter/decisions.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();
const mockStatusCreate = jest.fn();
const mockTransaction = jest.fn((fn) => fn({ afterCommit: jest.fn() }));

jest.unstable_mockModule('../../../models/index.js', () => ({
  Application: {
    findByPk: mockFindByPk,
    STATUSES: { approved: 4, rejected: 5, under_review: 2 },
  },
  StatusHistory: { create: mockStatusCreate },
  sequelize: { transaction: mockTransaction },
}));

const { approve, rejectApp } = await import('../../../controllers/underwriter/decisions.js');

describe('Underwriter Decisions Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 2, roleName: () => 'underwriter' },
      params: {},
      body: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('approve', () => {
    it('should approve an under_review application', async () => {
      const mockApp = {
        id: 1,
        status: 2,
        isUnderReview: () => true,
        save: jest.fn(),
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      req.body = { interest_rate: '5.99', loan_term: 60 };
      await approve(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.status).toBe(4);
    });

    it('should return 404 if not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await approve(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 422 if not under_review', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, isUnderReview: () => false });
      req.params.id = '1';
      await approve(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('rejectApp', () => {
    it('should reject an under_review application', async () => {
      const mockApp = {
        id: 1,
        status: 2,
        isUnderReview: () => true,
        save: jest.fn(),
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      req.body = { rejection_reason: 'Insufficient income' };
      await rejectApp(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.status).toBe(5);
    });

    it('should return 422 if no rejection_reason', async () => {
      const mockApp = { id: 1, isUnderReview: () => true };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      req.body = {};
      await rejectApp(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
