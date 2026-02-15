// src/models/index.js
// Maps: app/models/application_record.rb + all model requires
import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js';
import UserModel from './User.js';
import ApplicationModel from './Application.js';
import DocumentModel from './Document.js';
import VehicleModel from './Vehicle.js';
import AddressModel from './Address.js';
import FinancialInfoModel from './FinancialInfo.js';
import ApplicationNoteModel from './ApplicationNote.js';
import StatusHistoryModel from './StatusHistory.js';
import ApiKeyModel from './ApiKey.js';
import SecurityAuditLogModel from './SecurityAuditLog.js';
import JwtDenylistModel from './JwtDenylist.js';

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env] || databaseConfig.development;

const sequelize = config.use_env_variable
  ? new Sequelize.Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize.Sequelize(config.database, config.username, config.password, config);

const User = UserModel(sequelize);
const Application = ApplicationModel(sequelize);
const Document = DocumentModel(sequelize);
const Vehicle = VehicleModel(sequelize);
const Address = AddressModel(sequelize);
const FinancialInfo = FinancialInfoModel(sequelize);
const ApplicationNote = ApplicationNoteModel(sequelize);
const StatusHistory = StatusHistoryModel(sequelize);
const ApiKey = ApiKeyModel(sequelize);
const SecurityAuditLog = SecurityAuditLogModel(sequelize);
const JwtDenylist = JwtDenylistModel(sequelize);

const models = {
  User,
  Application,
  Document,
  Vehicle,
  Address,
  FinancialInfo,
  ApplicationNote,
  StatusHistory,
  ApiKey,
  SecurityAuditLog,
  JwtDenylist,
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

export {
  sequelize,
  User,
  Application,
  Document,
  Vehicle,
  Address,
  FinancialInfo,
  ApplicationNote,
  StatusHistory,
  ApiKey,
  SecurityAuditLog,
  JwtDenylist,
};

export default models;
