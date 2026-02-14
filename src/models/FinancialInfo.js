// src/models/FinancialInfo.js
// Maps: app/models/financial_info.rb
import { DataTypes } from 'sequelize';

const VALID_EMPLOYMENT_STATUSES = [
  'full_time',
  'part_time',
  'self_employed',
  'retired',
  'unemployed',
];
const VALID_INCOME_TYPES = ['primary', 'secondary', 'other'];

export default (sequelize) => {
  const FinancialInfo = sequelize.define(
    'FinancialInfo',
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
      employment_status: {
        type: DataTypes.STRING,
        validate: { isIn: [VALID_EMPLOYMENT_STATUSES] },
      },
      income_type: {
        type: DataTypes.STRING,
        validate: { isIn: [VALID_INCOME_TYPES] },
      },
      employer_name: DataTypes.STRING,
      job_title: DataTypes.STRING,
      years_employed: DataTypes.INTEGER,
      months_employed: DataTypes.INTEGER,
      annual_income: DataTypes.DECIMAL(12, 2),
      monthly_income: DataTypes.DECIMAL(10, 2),
      monthly_expenses: DataTypes.DECIMAL(10, 2),
      other_income: DataTypes.DECIMAL(10, 2),
      credit_score: {
        type: DataTypes.INTEGER,
        validate: { min: 300, max: 850 },
      },
    },
    {
      tableName: 'financial_infos',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  FinancialInfo.associate = (models) => {
    FinancialInfo.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application',
    });
  };

  FinancialInfo.VALID_EMPLOYMENT_STATUSES = VALID_EMPLOYMENT_STATUSES;
  FinancialInfo.VALID_INCOME_TYPES = VALID_INCOME_TYPES;

  return FinancialInfo;
};
