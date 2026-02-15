// src/__tests__/middleware/authorize.test.js
import { jest } from '@jest/globals';

const { requireRole, requireCustomer, requireStaff, authorizeApplication, requireScope } =
  await import('../../middleware/authorize.js');

describe('requireRole middleware', () => {
  let req, res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if no user', () => {
    req = {};
    requireRole('customer')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if role matches', () => {
    req = { user: { roleName: () => 'customer' } };
    requireRole('customer')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if role does not match', () => {
    req = { user: { roleName: () => 'customer' } };
    requireRole('underwriter')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept multiple roles', () => {
    req = { user: { roleName: () => 'loan_officer' } };
    requireRole('loan_officer', 'underwriter')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireCustomer shorthand', () => {
  it('should pass for customer role', () => {
    const req = { user: { roleName: () => 'customer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireCustomer(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireStaff shorthand', () => {
  it('should pass for loan_officer', () => {
    const req = { user: { roleName: () => 'loan_officer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should pass for underwriter', () => {
    const req = { user: { roleName: () => 'underwriter' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject customer', () => {
    const req = { user: { roleName: () => 'customer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('authorizeApplication middleware', () => {
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('show: owner can view', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1 },
    };
    authorizeApplication('show')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('show: staff can view', () => {
    const req = {
      user: { id: 2, roleName: () => 'loan_officer' },
      application: { user_id: 1 },
    };
    authorizeApplication('show')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('show: non-owner customer cannot view', () => {
    const req = {
      user: { id: 2, roleName: () => 'customer' },
      application: { user_id: 1 },
    };
    authorizeApplication('show')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('create: only customer can create', () => {
    const req = { user: { roleName: () => 'customer' }, application: {} };
    authorizeApplication('create')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('create: staff cannot create', () => {
    const req = { user: { roleName: () => 'loan_officer' }, application: {} };
    authorizeApplication('create')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('update: customer can update own draft', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isDraft: () => true, isPendingDocuments: () => false },
    };
    authorizeApplication('update')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('update: customer can update own pending_documents', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isDraft: () => false, isPendingDocuments: () => true },
    };
    authorizeApplication('update')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('update: customer cannot update submitted app', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isDraft: () => false, isPendingDocuments: () => false },
    };
    authorizeApplication('update')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('update: staff can update any', () => {
    const req = {
      user: { id: 2, roleName: () => 'underwriter' },
      application: { user_id: 1 },
    };
    authorizeApplication('update')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('destroy: customer can destroy own draft', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isDraft: () => true },
    };
    authorizeApplication('destroy')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('submit: customer can submit own draft', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isDraft: () => true },
    };
    authorizeApplication('submit')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('sign: customer can sign own approved', () => {
    const req = {
      user: { id: 1, roleName: () => 'customer' },
      application: { user_id: 1, isApproved: () => true },
    };
    authorizeApplication('sign')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('review: staff can review', () => {
    const req = {
      user: { roleName: () => 'loan_officer' },
      application: {},
    };
    authorizeApplication('review')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('approve: only underwriter', () => {
    const req = { user: { roleName: () => 'underwriter' }, application: {} };
    authorizeApplication('approve')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('approve: loan_officer cannot approve', () => {
    const req = { user: { roleName: () => 'loan_officer' }, application: {} };
    authorizeApplication('approve')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('reject: only underwriter', () => {
    const req = { user: { roleName: () => 'underwriter' }, application: {} };
    authorizeApplication('reject')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('unknown action: should reject', () => {
    const req = { user: { roleName: () => 'customer' }, application: {} };
    authorizeApplication('unknown')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireScope middleware', () => {
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should pass if scope present', () => {
    const req = { jwtPayload: { scopes: ['applications:read'] } };
    requireScope('applications:read')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject if scope missing', () => {
    const req = { jwtPayload: { scopes: ['applications:read'] } };
    requireScope('applications:approve')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should reject if no payload', () => {
    const req = {};
    requireScope('applications:read')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
