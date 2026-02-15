// src/__tests__/controllers/applicationUpdate.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();

jest.unstable_mockModule('../../models/index.js', () => ({
  Application: { findByPk: mockFindByPk },
  Vehicle: { upsert: jest.fn() },
  Address: { destroy: jest.fn(), bulkCreate: jest.fn() },
  FinancialInfo: { destroy: jest.fn(), bulkCreate: jest.fn() },
  sequelize: { transaction: jest.fn((fn) => fn({ afterCommit: jest.fn() })) },
}));

const { update } = await import('../../controllers/applicationUpdate.js');

describe('Application Update Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1, roleName: () => 'customer' },
      params: { id: '1' },
      body: { loan_amount: '30000.00', loan_term: 72 },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should update draft application fields', async () => {
    const mockApp = {
      id: 1,
      user_id: 1,
      isDraft: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    await update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockApp.loan_amount).toBe('30000.00');
  });

  it('should return 404 if not found', async () => {
    mockFindByPk.mockResolvedValue(null);
    await update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 403 if not owner', async () => {
    mockFindByPk.mockResolvedValue({ id: 1, user_id: 99, isDraft: () => true });
    await update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 422 if not draft', async () => {
    mockFindByPk.mockResolvedValue({ id: 1, user_id: 1, isDraft: () => false });
    await update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should call next on error', async () => {
    mockFindByPk.mockRejectedValue(new Error('fail'));
    await update(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
