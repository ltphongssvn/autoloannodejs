// src/__tests__/controllers/applicationSign.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();
const mockStatusCreate = jest.fn();
const mockTransaction = jest.fn((fn) => fn({ afterCommit: jest.fn() }));

jest.unstable_mockModule('../../models/index.js', () => ({
  Application: {
    findByPk: mockFindByPk,
    STATUSES: { approved: 4, pending: 6 },
  },
  StatusHistory: { create: mockStatusCreate },
  sequelize: { transaction: mockTransaction },
}));

const { sign } = await import('../../controllers/applicationSign.js');

describe('Application Sign Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1, roleName: () => 'customer' },
      params: { id: '1' },
      body: { agreement_accepted: true },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should sign an approved application', async () => {
    const mockApp = {
      id: 1,
      user_id: 1,
      isApproved: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    await sign(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockApp.agreement_accepted).toBe(true);
    expect(mockApp.signed_at).toBeDefined();
  });

  it('should return 404 if not found', async () => {
    mockFindByPk.mockResolvedValue(null);
    await sign(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 403 if not owner', async () => {
    mockFindByPk.mockResolvedValue({ id: 1, user_id: 99, isApproved: () => true });
    await sign(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 422 if not approved', async () => {
    mockFindByPk.mockResolvedValue({ id: 1, user_id: 1, isApproved: () => false });
    await sign(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should return 422 if agreement not accepted', async () => {
    const mockApp = { id: 1, user_id: 1, isApproved: () => true };
    mockFindByPk.mockResolvedValue(mockApp);
    req.body = { agreement_accepted: false };
    await sign(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});
