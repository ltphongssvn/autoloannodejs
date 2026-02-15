// src/__tests__/models/simpleModels.test.js
import { jest } from '@jest/globals';

const mockDefine = jest.fn().mockReturnValue({ prototype: {}, associate: null });
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

const VehicleModel = (await import('../../models/Vehicle.js')).default;
const AddressModel = (await import('../../models/Address.js')).default;
const FinancialInfoModel = (await import('../../models/FinancialInfo.js')).default;
const ApplicationNoteModel = (await import('../../models/ApplicationNote.js')).default;
const StatusHistoryModel = (await import('../../models/StatusHistory.js')).default;

describe('Vehicle Model', () => {
  let Vehicle;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    Vehicle = VehicleModel(mockSequelize);
  });

  it('should define model with correct table name', () => {
    expect(mockDefine).toHaveBeenCalledWith(
      'Vehicle',
      expect.any(Object),
      expect.objectContaining({ tableName: 'vehicles', underscored: true }),
    );
  });

  it('should define make, model, year as required', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.make.allowNull).toBe(false);
    expect(fields.model.allowNull).toBe(false);
    expect(fields.year.allowNull).toBe(false);
  });

  it('should define application_id as unique', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.application_id.unique).toBe(true);
  });

  it('should define VALID_CONDITIONS', () => {
    expect(Vehicle.VALID_CONDITIONS).toEqual(['new', 'used', 'certified']);
  });

  it('should define associate function', () => {
    expect(typeof Vehicle.associate).toBe('function');
  });
});

describe('Address Model', () => {
  let Address;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    Address = AddressModel(mockSequelize);
  });

  it('should define model with correct table name', () => {
    expect(mockDefine).toHaveBeenCalledWith(
      'Address',
      expect.any(Object),
      expect.objectContaining({ tableName: 'addresses', underscored: true }),
    );
  });

  it('should define required fields', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.address_type.allowNull).toBe(false);
    expect(fields.street_address.allowNull).toBe(false);
    expect(fields.city.allowNull).toBe(false);
    expect(fields.state.allowNull).toBe(false);
    expect(fields.zip_code.allowNull).toBe(false);
  });

  it('should define VALID_TYPES', () => {
    expect(Address.VALID_TYPES).toEqual(['residential', 'mailing', 'previous']);
  });

  it('should define associate function', () => {
    expect(typeof Address.associate).toBe('function');
  });
});

describe('FinancialInfo Model', () => {
  let FinancialInfo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    FinancialInfo = FinancialInfoModel(mockSequelize);
  });

  it('should define model with correct table name', () => {
    expect(mockDefine).toHaveBeenCalledWith(
      'FinancialInfo',
      expect.any(Object),
      expect.objectContaining({ tableName: 'financial_infos', underscored: true }),
    );
  });

  it('should define credit_score with min/max validation', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.credit_score.validate.min).toBe(300);
    expect(fields.credit_score.validate.max).toBe(850);
  });

  it('should define VALID_EMPLOYMENT_STATUSES', () => {
    expect(FinancialInfo.VALID_EMPLOYMENT_STATUSES).toEqual([
      'full_time',
      'part_time',
      'self_employed',
      'retired',
      'unemployed',
    ]);
  });

  it('should define VALID_INCOME_TYPES', () => {
    expect(FinancialInfo.VALID_INCOME_TYPES).toEqual(['primary', 'secondary', 'other']);
  });

  it('should define associate function', () => {
    expect(typeof FinancialInfo.associate).toBe('function');
  });
});

describe('ApplicationNote Model', () => {
  let ApplicationNote;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    ApplicationNote = ApplicationNoteModel(mockSequelize);
  });

  it('should define model with correct table name', () => {
    expect(mockDefine).toHaveBeenCalledWith(
      'ApplicationNote',
      expect.any(Object),
      expect.objectContaining({ tableName: 'application_notes', underscored: true }),
    );
  });

  it('should define note as required', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.note.allowNull).toBe(false);
  });

  it('should define internal field', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.internal).toBeDefined();
  });

  it('should define associate function', () => {
    expect(typeof ApplicationNote.associate).toBe('function');
  });
});

describe('StatusHistory Model', () => {
  let StatusHistory;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({ prototype: {}, associate: null });
    StatusHistory = StatusHistoryModel(mockSequelize);
  });

  it('should define model with correct table name', () => {
    expect(mockDefine).toHaveBeenCalledWith(
      'StatusHistory',
      expect.any(Object),
      expect.objectContaining({ tableName: 'status_histories', underscored: true }),
    );
  });

  it('should define from_status and to_status', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.from_status).toBeDefined();
    expect(fields.to_status).toBeDefined();
  });

  it('should define comment field', () => {
    const fields = mockDefine.mock.calls[0][1];
    expect(fields.comment).toBeDefined();
  });

  it('should define associate function', () => {
    expect(typeof StatusHistory.associate).toBe('function');
  });
});
