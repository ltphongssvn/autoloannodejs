// src/__tests__/controllers/loanOfficer/review.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();
const mockStatusCreate = jest.fn();
const mockNoteCreate = jest.fn();
const mockTransaction = jest.fn((fn) => fn({ afterCommit: jest.fn() }));

jest.unstable_mockModule('../../../models/index.js', () => ({
  Application: {
    findByPk: mockFindByPk,
    STATUSES: { under_review: 2, pending_documents: 3, submitted: 1 },
  },
  StatusHistory: { create: mockStatusCreate },
  ApplicationNote: { create: mockNoteCreate },
  sequelize: { transaction: mockTransaction },
}));

const { startReview, requestDocuments, addNote } =
  await import('../../../controllers/loanOfficer/review.js');

describe('Loan Officer Review Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 2, roleName: () => 'loan_officer' }, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('startReview', () => {
    it('should move submitted app to under_review', async () => {
      const mockApp = {
        id: 1,
        status: 1,
        isSubmitted: () => true,
        save: jest.fn(),
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      await startReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.status).toBe(2);
    });

    it('should return 404 if not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      req.params.id = '999';
      await startReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 422 if not submitted', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, isSubmitted: () => false });
      req.params.id = '1';
      await startReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('requestDocuments', () => {
    it('should move app to pending_documents', async () => {
      const mockApp = {
        id: 1,
        status: 2,
        isUnderReview: () => true,
        save: jest.fn(),
        toJSON: () => ({ id: 1 }),
      };
      mockFindByPk.mockResolvedValue(mockApp);
      req.params.id = '1';
      req.body = { note: 'Need proof of income' };
      await requestDocuments(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockApp.status).toBe(3);
    });

    it('should return 422 if not under_review', async () => {
      mockFindByPk.mockResolvedValue({ id: 1, isUnderReview: () => false });
      req.params.id = '1';
      await requestDocuments(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('addNote', () => {
    it('should add a note to application', async () => {
      mockFindByPk.mockResolvedValue({ id: 1 });
      mockNoteCreate.mockResolvedValue({ id: 1, note: 'Test note' });
      req.params.id = '1';
      req.body = { note: 'Test note' };
      await addNote(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 422 if no note', async () => {
      mockFindByPk.mockResolvedValue({ id: 1 });
      req.params.id = '1';
      req.body = {};
      await addNote(req, res, next);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
