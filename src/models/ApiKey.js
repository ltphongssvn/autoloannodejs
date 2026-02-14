// src/models/ApiKey.js
// Maps: app/models/api_key.rb
import { DataTypes } from 'sequelize';
import crypto from 'crypto';

export default (sequelize) => {
  const ApiKey = sequelize.define(
    'ApiKey',
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      key_digest: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      expires_at: DataTypes.DATE,
      last_used_at: DataTypes.DATE,
    },
    {
      tableName: 'api_keys',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  // Generate a new API key: ak_<64 hex chars>
  ApiKey.generateKey = function () {
    return `ak_${crypto.randomBytes(32).toString('hex')}`;
  };

  // Hash key with SHA256 for storage
  ApiKey.digestKey = function (key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  };

  // Authenticate by raw key
  ApiKey.authenticate = async function (rawKey) {
    const digest = ApiKey.digestKey(rawKey);
    const apiKey = await ApiKey.findOne({
      where: { key_digest: digest, active: true },
    });
    if (!apiKey) return null;
    if (apiKey.isExpired()) return null;
    await apiKey.touchLastUsed();
    return apiKey;
  };

  ApiKey.prototype.isExpired = function () {
    return this.expires_at && new Date() > new Date(this.expires_at);
  };

  ApiKey.prototype.touchLastUsed = async function () {
    this.last_used_at = new Date();
    await this.save({ fields: ['last_used_at'] });
  };

  ApiKey.prototype.revoke = async function () {
    this.active = false;
    await this.save({ fields: ['active'] });
  };

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ApiKey;
};
