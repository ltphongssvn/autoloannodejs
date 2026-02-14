// src/models/Vehicle.js
// Maps: app/models/vehicle.rb
import { DataTypes } from 'sequelize';

const VALID_CONDITIONS = ['new', 'used', 'certified'];

export default (sequelize) => {
  const Vehicle = sequelize.define(
    'Vehicle',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      make: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vin: {
        type: DataTypes.STRING,
        unique: true,
      },
      trim: DataTypes.STRING,
      condition: {
        type: DataTypes.STRING,
        validate: { isIn: [VALID_CONDITIONS] },
      },
      estimated_value: DataTypes.DECIMAL(10, 2),
      mileage: DataTypes.INTEGER,
    },
    {
      tableName: 'vehicles',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.Application, { foreignKey: 'application_id', as: 'application' });
  };

  Vehicle.VALID_CONDITIONS = VALID_CONDITIONS;

  return Vehicle;
};
