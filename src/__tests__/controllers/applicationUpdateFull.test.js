// src/__tests__/controllers/applicationUpdateFull.test.js
import { jest } from '@jest/globals';

const mockFindByPk = jest.fn();
const mockVehicleUpsert = jest.fn();
const mockAddressDestroy = jest.fn();
const mockAddressBulkCreate = jest.fn();
const mockFinancialDestroy = jest.fn();
const mockFinancialBulkCreate = jest.fn();
const mockTransaction = jest.fn((fn) => fn({ afterCommit: jest.fn() }));

jest.unstable_mockModule('../../models/index.js', () => ({
  Application: { findByPk: mockFindByPk },
  Vehicle: { upsert: mockVehicleUpsert },
  Address: { destroy: mockAddressDestroy, bulkCreate: mockAddressBulkCreate },
  FinancialInfo: { destroy: mockFinancialDestroy, bulkCreate: mockFinancialBulkCreate },
  sequelize: { transaction: mockTransaction },
}));

const { update } = await import('../../controllers/applicationUpdate.js');

describe('Application Update - nested resources', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1, roleName: () => 'customer' },
      params: { id: '1' },
      body: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should update vehicle nested data', async () => {
    const mockApp = {
      id: 1,
      user_id: 1,
      isDraft: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    req.body = { vehicle: { make: 'Honda', model: 'Civic', year: 2024 } };
    await update(req, res, next);
    expect(mockVehicleUpsert).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should replace addresses', async () => {
    const mockApp = {
      id: 1,
      user_id: 1,
      isDraft: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    req.body = { addresses: [{ street_address: '456 Oak', city: 'LA', state: 'CA' }] };
    await update(req, res, next);
    expect(mockAddressDestroy).toHaveBeenCalled();
    expect(mockAddressBulkCreate).toHaveBeenCalled();
  });

  it('should replace financial_infos', async () => {
    const mockApp = {
      id: 1,
      user_id: 1,
      isDraft: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    req.body = { financial_infos: [{ employment_status: 'full_time', annual_income: '80000' }] };
    await update(req, res, next);
    expect(mockFinancialDestroy).toHaveBeenCalled();
    expect(mockFinancialBulkCreate).toHaveBeenCalled();
  });

  it('should allow staff to update other users app', async () => {
    const mockApp = {
      id: 1,
      user_id: 99,
      isDraft: () => true,
      save: jest.fn(),
      toJSON: () => ({ id: 1 }),
    };
    mockFindByPk.mockResolvedValue(mockApp);
    req.user = { id: 2, roleName: () => 'loan_officer' };
    req.body = { loan_amount: '50000' };
    await update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
