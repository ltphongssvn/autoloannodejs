// src/models/StatusHistory.js
// Maps: app/models/status_history.rb
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const StatusHistory = sequelize.define(
    'StatusHistory',
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
      user_id: DataTypes.BIGINT,
      from_status: DataTypes.STRING,
      to_status: DataTypes.STRING,
      comment: DataTypes.TEXT,
    },
    {
      tableName: 'status_histories',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  StatusHistory.associate = (models) => {
    StatusHistory.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application',
    });
    StatusHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return StatusHistory;
};
