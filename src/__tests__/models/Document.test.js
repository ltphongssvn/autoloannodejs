// src/__tests__/models/Document.test.js
import { jest } from '@jest/globals';

const mockDefine = jest.fn().mockReturnValue({ prototype: {}, associate: null });
const mockSequelize = { define: mockDefine };

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    DATE: 'DATE',
    TEXT: 'TEXT',
  },
}));

const DocumentModel = (await import('../../models/Document.js')).default;

describe('Document Model', () => {
  let Document;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    Document = DocumentModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'Document',
        expect.any(Object),
        expect.objectContaining({ tableName: 'documents', underscored: true }),
      );
    });

    it('should define file_name as required', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.file_name.allowNull).toBe(false);
    });

    it('should define doc_type with default other', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.doc_type.defaultValue).toBe(6);
    });

    it('should define status with default pending', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.status.defaultValue).toBe(0);
    });
  });

  describe('Static Constants', () => {
    it('should define DOC_TYPES', () => {
      expect(Document.DOC_TYPES).toEqual({
        drivers_license: 0,
        proof_income: 1,
        proof_address: 2,
        bank_statement: 3,
        vehicle_purchase: 4,
        insurance: 5,
        other: 6,
      });
    });

    it('should define DOC_TYPE_NAMES', () => {
      expect(Document.DOC_TYPE_NAMES[0]).toBe('drivers_license');
      expect(Document.DOC_TYPE_NAMES[6]).toBe('other');
    });

    it('should define DOC_STATUSES', () => {
      expect(Document.DOC_STATUSES).toEqual({
        pending: 0,
        verified: 1,
        rejected: 2,
        requested: 3,
      });
    });

    it('should define DOC_STATUS_NAMES', () => {
      expect(Document.DOC_STATUS_NAMES[0]).toBe('pending');
      expect(Document.DOC_STATUS_NAMES[1]).toBe('verified');
    });
  });

  describe('Instance Methods', () => {
    let doc;

    beforeEach(() => {
      doc = Object.create(Document.prototype);
      doc.doc_type = 0;
      doc.status = 0;
    });

    it('docTypeName() should return string name', () => {
      expect(doc.docTypeName()).toBe('drivers_license');
      doc.doc_type = 3;
      expect(doc.docTypeName()).toBe('bank_statement');
    });

    it('statusName() should return string name', () => {
      expect(doc.statusName()).toBe('pending');
      doc.status = 1;
      expect(doc.statusName()).toBe('verified');
    });
  });

  describe('Associations', () => {
    it('should define associate function', () => {
      expect(typeof Document.associate).toBe('function');
    });
  });
});
