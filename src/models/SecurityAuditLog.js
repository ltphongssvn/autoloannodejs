// src/models/SecurityAuditLog.js
// Maps: app/models/security_audit_log.rb
import { DataTypes, Op } from 'sequelize';

const EVENT_TYPES = [
  'login_success',
  'login_failure',
  'logout',
  'token_refresh',
  'mfa_setup',
  'mfa_enable',
  'mfa_disable',
  'mfa_verify_success',
  'mfa_verify_failure',
  'permission_denied',
  'rate_limit_exceeded',
  'password_reset_request',
  'password_reset_complete',
  'account_locked',
  'account_unlocked',
];

export default (sequelize) => {
  const SecurityAuditLog = sequelize.define(
    'SecurityAuditLog',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.BIGINT,
      event_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [EVENT_TYPES] },
      },
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      resource_type: DataTypes.STRING,
      resource_id: DataTypes.STRING,
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'security_audit_logs',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  SecurityAuditLog.logEvent = async function ({
    userId,
    eventType,
    ipAddress,
    userAgent,
    resourceType,
    resourceId,
    metadata,
    success = true,
  }) {
    return SecurityAuditLog.create({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      success,
    });
  };

  SecurityAuditLog.failedLoginsForIp = async function (ipAddress, since = null) {
    const where = {
      ip_address: ipAddress,
      event_type: 'login_failure',
    };
    if (since) where.created_at = { [Op.gte]: since };
    return SecurityAuditLog.count({ where });
  };

  SecurityAuditLog.failedLoginsForUser = async function (userId, since = null) {
    const where = {
      user_id: userId,
      event_type: 'login_failure',
    };
    if (since) where.created_at = { [Op.gte]: since };
    return SecurityAuditLog.count({ where });
  };

  SecurityAuditLog.EVENT_TYPES = EVENT_TYPES;

  return SecurityAuditLog;
};
