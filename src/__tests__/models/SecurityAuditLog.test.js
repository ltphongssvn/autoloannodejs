// src/__tests__/models/SecurityAuditLog.test.js
import { jest } from '@jest/globals';

const mockCreate = jest.fn().mockResolvedValue({});
const mockCount = jest.fn().mockResolvedValue(5);
const mockDefine = jest.fn().mockReturnValue({
  prototype: {},
  create: mockCreate,
  count: mockCount,
});
const mockSequelize = { define: mockDefine };

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    JSONB: 'JSONB',
  },
  Op: { gte: Symbol('gte') },
}));

const SecurityAuditLogModel = (await import('../../models/SecurityAuditLog.js')).default;

describe('SecurityAuditLog Model', () => {
  let SecurityAuditLog;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({
      prototype: {},
      create: mockCreate,
      count: mockCount,
    });
    SecurityAuditLog = SecurityAuditLogModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'SecurityAuditLog',
        expect.any(Object),
        expect.objectContaining({ tableName: 'security_audit_logs', underscored: true }),
      );
    });

    it('should define event_type as required', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.event_type.allowNull).toBe(false);
    });

    it('should define metadata with JSONB default', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.metadata.type).toBe('JSONB');
    });

    it('should define success with default true', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.success.defaultValue).toBe(true);
    });
  });

  describe('Static Constants', () => {
    it('should define EVENT_TYPES array', () => {
      expect(SecurityAuditLog.EVENT_TYPES).toContain('login_success');
      expect(SecurityAuditLog.EVENT_TYPES).toContain('login_failure');
      expect(SecurityAuditLog.EVENT_TYPES).toContain('logout');
      expect(SecurityAuditLog.EVENT_TYPES).toContain('mfa_setup');
      expect(SecurityAuditLog.EVENT_TYPES).toContain('permission_denied');
      expect(SecurityAuditLog.EVENT_TYPES).toContain('rate_limit_exceeded');
    });
  });

  describe('Static Methods', () => {
    it('logEvent() should create a log entry', async () => {
      await SecurityAuditLog.logEvent({
        userId: 1,
        eventType: 'login_success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        success: true,
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          event_type: 'login_success',
          ip_address: '127.0.0.1',
          success: true,
        }),
      );
    });

    it('failedLoginsForIp() should count failures', async () => {
      const count = await SecurityAuditLog.failedLoginsForIp('127.0.0.1');
      expect(count).toBe(5);
      expect(mockCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ip_address: '127.0.0.1',
            event_type: 'login_failure',
          }),
        }),
      );
    });

    it('failedLoginsForIp() should filter by since date', async () => {
      const since = new Date('2024-01-01');
      await SecurityAuditLog.failedLoginsForIp('127.0.0.1', since);
      expect(mockCount).toHaveBeenCalled();
    });

    it('failedLoginsForUser() should count failures', async () => {
      const count = await SecurityAuditLog.failedLoginsForUser(1);
      expect(count).toBe(5);
      expect(mockCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: 1,
            event_type: 'login_failure',
          }),
        }),
      );
    });

    it('failedLoginsForUser() should filter by since date', async () => {
      const since = new Date('2024-01-01');
      await SecurityAuditLog.failedLoginsForUser(1, since);
      expect(mockCount).toHaveBeenCalled();
    });
  });
});
