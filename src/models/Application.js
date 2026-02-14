// src/models/Application.js
// Maps: app/models/application.rb
import { DataTypes } from 'sequelize';

const STATUSES = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  pending_documents: 3,
  approved: 4,
  rejected: 5,
  pending: 6,
};
const STATUS_NAMES = Object.fromEntries(Object.entries(STATUSES).map(([k, v]) => [v, k]));

export default (sequelize) => {
  const Application = sequelize.define(
    'Application',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      application_number: {
        type: DataTypes.STRING,
        unique: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: STATUSES.draft,
        validate: { isIn: [Object.values(STATUSES)] },
      },
      current_step: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1, max: 5 },
      },
      dob: DataTypes.DATEONLY,
      ssn_encrypted: DataTypes.STRING,
      loan_amount: DataTypes.DECIMAL(10, 2),
      down_payment: DataTypes.DECIMAL(10, 2),
      loan_term: DataTypes.INTEGER,
      interest_rate: DataTypes.DECIMAL(5, 2),
      monthly_payment: DataTypes.DECIMAL(10, 2),
      rejection_reason: DataTypes.TEXT,
      signature_data: DataTypes.TEXT,
      signed_at: DataTypes.DATE,
      agreement_accepted: DataTypes.BOOLEAN,
      submitted_at: DataTypes.DATE,
      decided_at: DataTypes.DATE,
    },
    {
      tableName: 'applications',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  // Instance methods
  Application.prototype.statusName = function () {
    return STATUS_NAMES[this.status];
  };

  Application.prototype.isDraft = function () {
    return this.status === STATUSES.draft;
  };

  Application.prototype.isSubmitted = function () {
    return this.status === STATUSES.submitted;
  };

  Application.prototype.isUnderReview = function () {
    return this.status === STATUSES.under_review;
  };

  Application.prototype.isPendingDocuments = function () {
    return this.status === STATUSES.pending_documents;
  };

  Application.prototype.isApproved = function () {
    return this.status === STATUSES.approved;
  };

  Application.prototype.isRejected = function () {
    return this.status === STATUSES.rejected;
  };

  Application.prototype.isPending = function () {
    return this.status === STATUSES.pending;
  };

  Application.prototype.isSigned = function () {
    return this.signed_at !== null && this.agreement_accepted === true;
  };

  // Associations
  Application.associate = (models) => {
    Application.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Application.hasMany(models.Document, {
      foreignKey: 'application_id',
      as: 'documents',
      onDelete: 'CASCADE',
    });
    Application.hasMany(models.StatusHistory, {
      foreignKey: 'application_id',
      as: 'statusHistories',
      onDelete: 'CASCADE',
    });
    Application.hasMany(models.ApplicationNote, {
      foreignKey: 'application_id',
      as: 'applicationNotes',
      onDelete: 'CASCADE',
    });
    Application.hasMany(models.Address, {
      foreignKey: 'application_id',
      as: 'addresses',
      onDelete: 'CASCADE',
    });
    Application.hasOne(models.Vehicle, {
      foreignKey: 'application_id',
      as: 'vehicle',
      onDelete: 'CASCADE',
    });
    Application.hasMany(models.FinancialInfo, {
      foreignKey: 'application_id',
      as: 'financialInfos',
      onDelete: 'CASCADE',
    });
  };

  // Static constants
  Application.STATUSES = STATUSES;
  Application.STATUS_NAMES = STATUS_NAMES;

  return Application;
};
