// src/models/ApplicationNote.js
// Maps: app/models/application_note.rb
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ApplicationNote = sequelize.define(
    'ApplicationNote',
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
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      internal: DataTypes.BOOLEAN,
    },
    {
      tableName: 'application_notes',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      defaultScope: {
        order: [['created_at', 'DESC']],
      },
    },
  );

  ApplicationNote.associate = (models) => {
    ApplicationNote.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application',
    });
    ApplicationNote.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ApplicationNote;
};
