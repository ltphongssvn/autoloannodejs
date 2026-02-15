// src/__tests__/controllers/documents.test.js
import { jest } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockAppFindByPk = jest.fn();

jest.unstable_mockModule('../../models/index.js', () => ({
  Document: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    create: mockCreate,
    DOC_TYPES: { other: 6 },
    DOC_STATUSES: { pending: 0, verified: 1, rejected: 2 },
  },
  Application: { findByPk: mockAppFindByPk },
}));

const { listByApplication, upload, verify, reject } =
  await import('../../controllers/documents.js');

describe('Documents Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1, roleName: () => 'customer' },
      params: {},
      body: {},
      file: null,
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('listByApplication', () => {
    it('should list documents for an application', async () => {
      mockAppFindByPk.mockResolvedValue({ id: 1, user_id: 1 });
      mockFindAll.mockResolvedValue([{ id: 1, file_name: 'test.pdf' }]);
      req.params.applicationId = '1';
      await listByApplication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if application not found', async () => {
      mockAppFindByPk.mockResolvedValue(null);
      req.params.applicationId = '999';
      await listByApplication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if customer views other app', async () => {
      mockAppFindByPk.mockResolvedValue({ id: 1, user_id: 99 });
      req.params.applicationId = '1';
      await listByApplication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('upload', () => {
    it('should create a document record', async () => {
      mockAppFindByPk.mockResolvedValue({ id: 1, user_id: 1 });
      mockCreate.mockResolvedValue({ id: 1, file_name: 'license.pdf' });
      req.params.applicationId = '1';
      req.body = { doc_type: 0, file_name: 'license.pdf' };
      await upload(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if application not found', async () => {
      mockAppFindByPk.mockResolvedValue(null);
      req.params.applicationId = '999';
      await upload(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('verify', () => {
    it('should verify a document', async () => {
      req.user = { id: 2, roleName: () => 'loan_officer' };
      const mockDoc = { id: 1, status: 0, save: jest.fn(), toJSON: () => ({ id: 1 }) };
      mockFindByPk.mockResolvedValue(mockDoc);
      req.params.id = '1';
      await verify(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockDoc.status).toBe(1);
    });

    it('should return 404 if doc not found', async () => {
      req.user = { id: 2, roleName: () => 'loan_officer' };
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await verify(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('reject', () => {
    it('should reject a document with note', async () => {
      req.user = { id: 2, roleName: () => 'loan_officer' };
      const mockDoc = { id: 1, status: 0, save: jest.fn(), toJSON: () => ({ id: 1 }) };
      mockFindByPk.mockResolvedValue(mockDoc);
      req.params.id = '1';
      req.body = { rejection_note: 'Blurry image' };
      await reject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockDoc.status).toBe(2);
    });
  });
});
