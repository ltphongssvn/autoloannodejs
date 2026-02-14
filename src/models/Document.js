// src/models/Document.js
// Maps: app/models/document.rb
import { DataTypes } from 'sequelize';

const DOC_TYPES = {
  drivers_license: 0,
  proof_income: 1,
  proof_address: 2,
  bank_statement: 3,
  vehicle_purchase: 4,
  insurance: 5,
  other: 6,
};
const DOC_TYPE_NAMES = Object.fromEntries(Object.entries(DOC_TYPES).map(([k, v]) => [v, k]));

const DOC_STATUSES = {
  pending: 0,
  verified: 1,
  rejected: 2,
  requested: 3,
};
const DOC_STATUS_NAMES = Object.fromEntries(Object.entries(DOC_STATUSES).map(([k, v]) => [v, k]));

export default (sequelize) => {
  const Document = sequelize.define(
    'Document',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      doc_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DOC_TYPES.other,
        validate: { isIn: [Object.values(DOC_TYPES)] },
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      file_url: DataTypes.STRING,
      file_size: DataTypes.INTEGER,
      content_type: DataTypes.STRING,
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DOC_STATUSES.pending,
        validate: { isIn: [Object.values(DOC_STATUSES)] },
      },
      rejection_note: DataTypes.TEXT,
      request_note: DataTypes.TEXT,
      uploaded_at: DataTypes.DATE,
      verified_at: DataTypes.DATE,
      verified_by_id: DataTypes.BIGINT,
    },
    {
      tableName: 'documents',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  Document.prototype.docTypeName = function () {
    return DOC_TYPE_NAMES[this.doc_type];
  };

  Document.prototype.statusName = function () {
    return DOC_STATUS_NAMES[this.status];
  };

  Document.associate = (models) => {
    Document.belongsTo(models.Application, { foreignKey: 'application_id', as: 'application' });
    Document.belongsTo(models.User, { foreignKey: 'verified_by_id', as: 'verifiedBy' });
  };

  Document.DOC_TYPES = DOC_TYPES;
  Document.DOC_TYPE_NAMES = DOC_TYPE_NAMES;
  Document.DOC_STATUSES = DOC_STATUSES;
  Document.DOC_STATUS_NAMES = DOC_STATUS_NAMES;

  return Document;
};
