// src/__tests__/controllers/applications.test.js
import { jest } from '@jest/globals';

const mockFindAndCountAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockTransaction = jest.fn((fn) => fn({ afterCommit: jest.fn() }));

jest.unstable_mockModule('../../models/index.js', () => ({
  Application: {
    findAndCountAll: mockFindAndCountAll,
    findByPk: mockFindByPk,
    STATUSES: { draft: 0, submitted: 1 },
  },
  StatusHistory: { create: jest.fn() },
  sequelize: { transaction: mockTransaction },
}));

jest.unstable_mockModule('../../services/applicationCreation.js', () => ({
  createApplication: mockCreate,
}));

const { index, show, create, submit, destroy } = await import('../../controllers/applications.js');

describe('Applications Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1, roleName: () => 'customer' },
      params: {},
      query: {},
      body: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('index', () => {
    it('should return paginated applications for customer', async () => {
      const mockApp = {
        id: 1,
        statusName: () => 'draft',
        toJSON: () => ({ id: 1, status: 0 }),
      };
      mockFindAndCountAll.mockResolvedValue({ rows: [mockApp], count: 1 });
      await index(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Array) }));
    });

    it('should call next on error', async () => {
      mockFindAndCountAll.mockRejectedValue(new Error('DB'));
      await index(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should return application by id', async () => {
      const mockApp = {
        id: 1,
        user_id: 1,
        statusName: () => 'draft',
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      await show(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await show(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if customer views other user app', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, user_id: 99 });
      req.params.id = '1';
      await show(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('create', () => {
    it('should create draft application', async () => {
      const mockApp = {
        id: 1,
        statusName: () => 'draft',
        toJSON: () => ({ id: 1 }),
      };
      mockCreate.mockResolvedValue(mockApp);
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should call next on error', async () => {
      mockCreate.mockRejectedValue(new Error('fail'));
      await create(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should submit a draft application', async () => {
      const mockApp = {
        id: 1,
        user_id: 1,
        status: 0,
        isDraft: () => true,
        save: jest.fn(),
        statusName: () => 'submitted',
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      await submit(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.save).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await submit(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not owner', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, user_id: 99, isDraft: () => true });
      req.params.id = '1';
      await submit(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 422 if not draft', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, user_id: 1, isDraft: () => false });
      req.params.id = '1';
      await submit(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('destroy', () => {
    it('should delete own draft application', async () => {
      const mockApp = { id: 1, user_id: 1, isDraft: () => true, destroy: jest.fn() };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      await destroy(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.destroy).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await destroy(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 422 if not draft', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, user_id: 1, isDraft: () => false });
      req.params.id = '1';
      await destroy(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
