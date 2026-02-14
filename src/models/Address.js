// src/models/Address.js
// Maps: app/models/address.rb
import { DataTypes } from 'sequelize';

const VALID_TYPES = ['residential', 'mailing', 'previous'];

export default (sequelize) => {
  const Address = sequelize.define(
    'Address',
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
      address_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [VALID_TYPES] },
      },
      street_address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      zip_code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      years_at_address: DataTypes.INTEGER,
      months_at_address: DataTypes.INTEGER,
    },
    {
      tableName: 'addresses',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  Address.associate = (models) => {
    Address.belongsTo(models.Application, { foreignKey: 'application_id', as: 'application' });
  };

  Address.VALID_TYPES = VALID_TYPES;

  return Address;
};
