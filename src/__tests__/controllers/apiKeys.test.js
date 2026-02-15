// src/__tests__/controllers/apiKeys.test.js
import { jest } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockGenerateKey = jest.fn().mockReturnValue('ak_testkey123');
const mockDigestKey = jest.fn().mockReturnValue('digest_abc');

jest.unstable_mockModule('../../models/index.js', () => ({
  ApiKey: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    create: mockCreate,
    generateKey: mockGenerateKey,
    digestKey: mockDigestKey,
  },
}));

const { listKeys, createKey, revokeKey } = await import('../../controllers/apiKeys.js');

describe('ApiKeys Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 1 }, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('listKeys', () => {
    it('should list user api keys', async () => {
      mockFindAll.mockResolvedValue([{ id: 1, name: 'My Key' }]);
      await listKeys(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createKey', () => {
    it('should create a new api key', async () => {
      req.body = { name: 'My Key' };
      mockCreate.mockResolvedValue({ id: 1, name: 'My Key', toJSON: () => ({ id: 1 }) });
      await createKey(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ raw_key: 'ak_testkey123' }) }),
      );
    });

    it('should return 422 if name missing', async () => {
      req.body = {};
      await createKey(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('revokeKey', () => {
    it('should revoke own api key', async () => {
      const mockKey = { id: 1, user_id: 1, revoke: jest.fn() };
      mockFindByPk.mockResolvedValue(mockKey);
      req.params.id = '1';
      await revokeKey(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockKey.revoke).toHaveBeenCalled();
    });

    it('should return 404 if key not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await revokeKey(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not owner', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, user_id: 99 });
      req.params.id = '1';
      await revokeKey(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
