// src/__tests__/models/Application.test.js
import { jest } from '@jest/globals';

const mockDefine = jest.fn().mockReturnValue({
  prototype: {},
  associate: null,
});
const mockSequelize = { define: mockDefine };

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    DATE: 'DATE',
    DATEONLY: 'DATEONLY',
    DECIMAL: jest.fn().mockReturnValue('DECIMAL'),
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
  },
}));

const ApplicationModel = (await import('../../models/Application.js')).default;

describe('Application Model', () => {
  let Application;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    Application = ApplicationModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'Application',
        expect.any(Object),
        expect.objectContaining({ tableName: 'applications', underscored: true }),
      );
    });

    it('should define status with default draft', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.status.defaultValue).toBe(0);
    });

    it('should define current_step with default 1 and range 1-5', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.current_step.defaultValue).toBe(1);
      expect(fields.current_step.validate.min).toBe(1);
      expect(fields.current_step.validate.max).toBe(5);
    });

    it('should define loan financial fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.loan_amount).toBeDefined();
      expect(fields.down_payment).toBeDefined();
      expect(fields.loan_term).toBeDefined();
      expect(fields.interest_rate).toBeDefined();
      expect(fields.monthly_payment).toBeDefined();
    });

    it('should define workflow timestamp fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.submitted_at).toBeDefined();
      expect(fields.decided_at).toBeDefined();
      expect(fields.signed_at).toBeDefined();
    });
  });

  describe('Static Constants', () => {
    it('should define STATUSES', () => {
      expect(Application.STATUSES).toEqual({
        draft: 0,
        submitted: 1,
        under_review: 2,
        pending_documents: 3,
        approved: 4,
        rejected: 5,
        pending: 6,
      });
    });

    it('should define STATUS_NAMES as inverse', () => {
      expect(Application.STATUS_NAMES[0]).toBe('draft');
      expect(Application.STATUS_NAMES[4]).toBe('approved');
      expect(Application.STATUS_NAMES[5]).toBe('rejected');
    });
  });

  describe('Instance Methods', () => {
    let app;

    beforeEach(() => {
      app = Object.create(Application.prototype);
      app.status = 0;
      app.signed_at = null;
      app.agreement_accepted = false;
    });

    it('statusName() should return string name', () => {
      expect(app.statusName()).toBe('draft');
      app.status = 4;
      expect(app.statusName()).toBe('approved');
    });

    it('isDraft() should check status 0', () => {
      expect(app.isDraft()).toBe(true);
      app.status = 1;
      expect(app.isDraft()).toBe(false);
    });

    it('isSubmitted() should check status 1', () => {
      app.status = 1;
      expect(app.isSubmitted()).toBe(true);
    });

    it('isUnderReview() should check status 2', () => {
      app.status = 2;
      expect(app.isUnderReview()).toBe(true);
    });

    it('isPendingDocuments() should check status 3', () => {
      app.status = 3;
      expect(app.isPendingDocuments()).toBe(true);
    });

    it('isApproved() should check status 4', () => {
      app.status = 4;
      expect(app.isApproved()).toBe(true);
    });

    it('isRejected() should check status 5', () => {
      app.status = 5;
      expect(app.isRejected()).toBe(true);
    });

    it('isPending() should check status 6', () => {
      app.status = 6;
      expect(app.isPending()).toBe(true);
    });

    it('isSigned() should require both signed_at and agreement_accepted', () => {
      expect(app.isSigned()).toBe(false);
      app.signed_at = new Date();
      expect(app.isSigned()).toBe(false);
      app.agreement_accepted = true;
      expect(app.isSigned()).toBe(true);
    });
  });

  describe('Associations', () => {
    it('should define associate function', () => {
      expect(typeof Application.associate).toBe('function');
    });
  });
});
