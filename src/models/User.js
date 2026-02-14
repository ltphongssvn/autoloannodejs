// src/models/User.js
// Maps: app/models/user.rb
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import appConfig from '../config/app.js';

// Role enum (maps: enum :role, { customer: 0, loan_officer: 1, underwriter: 2 })
const ROLES = { customer: 0, loan_officer: 1, underwriter: 2 };
const ROLE_NAMES = Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [v, k]));

// OAuth2 Scopes per role (maps: User::ROLE_SCOPES)
const ROLE_SCOPES = {
  customer: [
    'applications:read',
    'applications:write',
    'documents:read',
    'documents:write',
    'profile:read',
    'profile:write',
  ],
  loan_officer: [
    'applications:read',
    'applications:write',
    'applications:review',
    'documents:read',
    'documents:write',
    'documents:verify',
    'profile:read',
    'users:read',
  ],
  underwriter: [
    'applications:read',
    'applications:write',
    'applications:approve',
    'applications:reject',
    'documents:read',
    'documents:verify',
    'profile:read',
    'users:read',
  ],
};

export default (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      encrypted_password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        validate: { notEmpty: true },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        validate: { notEmpty: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^\+?\d{10,15}$/,
        },
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: ROLES.customer,
        validate: {
          isIn: [Object.values(ROLES)],
        },
      },
      jti: {
        type: DataTypes.STRING,
      },
      // Devise trackable
      sign_in_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      current_sign_in_at: DataTypes.DATE,
      last_sign_in_at: DataTypes.DATE,
      current_sign_in_ip: DataTypes.STRING,
      last_sign_in_ip: DataTypes.STRING,
      // Devise confirmable
      confirmation_token: DataTypes.STRING,
      confirmed_at: DataTypes.DATE,
      confirmation_sent_at: DataTypes.DATE,
      unconfirmed_email: DataTypes.STRING,
      // Devise recoverable
      reset_password_token: DataTypes.STRING,
      reset_password_sent_at: DataTypes.DATE,
      // Devise rememberable
      remember_created_at: DataTypes.DATE,
      // Devise lockable
      failed_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      locked_at: DataTypes.DATE,
      unlock_token: DataTypes.STRING,
      // MFA fields
      otp_secret: DataTypes.STRING,
      otp_required_for_login: DataTypes.BOOLEAN,
      otp_backup_codes: DataTypes.TEXT,
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  // Instance methods
  User.prototype.fullName = function () {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.roleName = function () {
    return ROLE_NAMES[this.role];
  };

  User.prototype.isCustomer = function () {
    return this.role === ROLES.customer;
  };

  User.prototype.isLoanOfficer = function () {
    return this.role === ROLES.loan_officer;
  };

  User.prototype.isUnderwriter = function () {
    return this.role === ROLES.underwriter;
  };

  User.prototype.scopes = function () {
    return ROLE_SCOPES[this.roleName()] || [];
  };

  User.prototype.jwtPayload = function () {
    return { role: this.roleName(), email: this.email, scopes: this.scopes() };
  };

  User.prototype.validPassword = async function (password) {
    return bcrypt.compare(password, this.encrypted_password);
  };

  // Hooks
  User.beforeCreate(async (user) => {
    if (user.encrypted_password && !user.encrypted_password.startsWith('$2')) {
      user.encrypted_password = await bcrypt.hash(
        user.encrypted_password,
        appConfig.password.saltRounds,
      );
    }
    // Normalize phone (maps: normalize_phone)
    if (user.phone) {
      if (user.phone.startsWith('+')) {
        user.phone = '+' + user.phone.slice(1).replace(/\D/g, '');
      } else {
        user.phone = user.phone.replace(/\D/g, '');
      }
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('encrypted_password') && !user.encrypted_password.startsWith('$2')) {
      user.encrypted_password = await bcrypt.hash(
        user.encrypted_password,
        appConfig.password.saltRounds,
      );
    }
    if (user.changed('phone') && user.phone) {
      if (user.phone.startsWith('+')) {
        user.phone = '+' + user.phone.slice(1).replace(/\D/g, '');
      } else {
        user.phone = user.phone.replace(/\D/g, '');
      }
    }
  });

  // Associations (defined in models/index.js)
  User.associate = (models) => {
    User.hasMany(models.Application, { foreignKey: 'user_id', as: 'applications' });
    User.hasMany(models.ApplicationNote, { foreignKey: 'user_id', as: 'applicationNotes' });
    User.hasMany(models.StatusHistory, { foreignKey: 'user_id', as: 'statusHistories' });
    User.hasMany(models.Document, {
      foreignKey: 'verified_by_id',
      as: 'verifiedDocuments',
    });
    User.hasMany(models.ApiKey, { foreignKey: 'user_id', as: 'apiKeys' });
  };

  // Static constants
  User.ROLES = ROLES;
  User.ROLE_NAMES = ROLE_NAMES;
  User.ROLE_SCOPES = ROLE_SCOPES;

  return User;
};
