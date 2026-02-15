// src/__tests__/models/associations.test.js
import { jest } from '@jest/globals';

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
    JSONB: 'JSONB',
  },
  Op: { lt: Symbol('lt'), gte: Symbol('gte') },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: { hash: jest.fn(), compare: jest.fn() },
}));

jest.unstable_mockModule('crypto', () => ({
  default: {
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'aa' }),
    createHash: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({ digest: jest.fn().mockReturnValue('x') }),
    }),
  },
}));

jest.unstable_mockModule('../../config/app.js', () => ({
  default: { password: { saltRounds: 1 } },
}));

const UserModel = (await import('../../models/User.js')).default;
const ApplicationModel = (await import('../../models/Application.js')).default;
const DocumentModel = (await import('../../models/Document.js')).default;
const VehicleModel = (await import('../../models/Vehicle.js')).default;
const AddressModel = (await import('../../models/Address.js')).default;
const FinancialInfoModel = (await import('../../models/FinancialInfo.js')).default;
const ApplicationNoteModel = (await import('../../models/ApplicationNote.js')).default;
const StatusHistoryModel = (await import('../../models/StatusHistory.js')).default;
const ApiKeyModel = (await import('../../models/ApiKey.js')).default;

const createMockObj = () => ({
  prototype: {},
  associate: null,
  hasMany: jest.fn(),
  hasOne: jest.fn(),
  belongsTo: jest.fn(),
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  destroy: jest.fn(),
});

const createSequelize = () => ({
  define: jest.fn().mockImplementation(() => createMockObj()),
});

describe('Model Associations', () => {
  it('User associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const Application = ApplicationModel(seq);
    const ApplicationNote = ApplicationNoteModel(seq);
    const StatusHistory = StatusHistoryModel(seq);
    const Document = DocumentModel(seq);
    const ApiKey = ApiKeyModel(seq);
    const models = { User, Application, ApplicationNote, StatusHistory, Document, ApiKey };
    User.associate(models);
    expect(User.hasMany).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
    expect(User.hasMany).toHaveBeenCalledWith(
      ApplicationNote,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
    expect(User.hasMany).toHaveBeenCalledWith(
      StatusHistory,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
    expect(User.hasMany).toHaveBeenCalledWith(
      ApiKey,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
  });

  it('Application associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const Application = ApplicationModel(seq);
    const Document = DocumentModel(seq);
    const Vehicle = VehicleModel(seq);
    const Address = AddressModel(seq);
    const FinancialInfo = FinancialInfoModel(seq);
    const ApplicationNote = ApplicationNoteModel(seq);
    const StatusHistory = StatusHistoryModel(seq);
    const models = {
      User,
      Application,
      Document,
      Vehicle,
      Address,
      FinancialInfo,
      ApplicationNote,
      StatusHistory,
    };
    Application.associate(models);
    expect(Application.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
    expect(Application.hasMany).toHaveBeenCalledWith(
      Document,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Application.hasMany).toHaveBeenCalledWith(
      StatusHistory,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Application.hasMany).toHaveBeenCalledWith(
      ApplicationNote,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Application.hasMany).toHaveBeenCalledWith(
      Address,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Application.hasOne).toHaveBeenCalledWith(
      Vehicle,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Application.hasMany).toHaveBeenCalledWith(
      FinancialInfo,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
  });

  it('Document associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const Application = ApplicationModel(seq);
    const Document = DocumentModel(seq);
    Document.associate({ User, Application, Document });
    expect(Document.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(Document.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ foreignKey: 'verified_by_id' }),
    );
  });

  it('Vehicle associations', () => {
    const seq = createSequelize();
    const Application = ApplicationModel(seq);
    const Vehicle = VehicleModel(seq);
    Vehicle.associate({ Application, Vehicle });
    expect(Vehicle.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
  });

  it('Address associations', () => {
    const seq = createSequelize();
    const Application = ApplicationModel(seq);
    const Address = AddressModel(seq);
    Address.associate({ Application, Address });
    expect(Address.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
  });

  it('FinancialInfo associations', () => {
    const seq = createSequelize();
    const Application = ApplicationModel(seq);
    const FinancialInfo = FinancialInfoModel(seq);
    FinancialInfo.associate({ Application, FinancialInfo });
    expect(FinancialInfo.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
  });

  it('ApplicationNote associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const Application = ApplicationModel(seq);
    const ApplicationNote = ApplicationNoteModel(seq);
    ApplicationNote.associate({ User, Application, ApplicationNote });
    expect(ApplicationNote.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(ApplicationNote.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
  });

  it('StatusHistory associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const Application = ApplicationModel(seq);
    const StatusHistory = StatusHistoryModel(seq);
    StatusHistory.associate({ User, Application, StatusHistory });
    expect(StatusHistory.belongsTo).toHaveBeenCalledWith(
      Application,
      expect.objectContaining({ foreignKey: 'application_id' }),
    );
    expect(StatusHistory.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
  });

  it('ApiKey associations', () => {
    const seq = createSequelize();
    const User = UserModel(seq);
    const ApiKey = ApiKeyModel(seq);
    ApiKey.associate({ User, ApiKey });
    expect(ApiKey.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({ foreignKey: 'user_id' }),
    );
  });
});
