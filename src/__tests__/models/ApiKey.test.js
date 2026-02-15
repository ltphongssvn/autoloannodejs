// src/__tests__/models/ApiKey.test.js
import { jest } from '@jest/globals';

const mockSave = jest.fn().mockResolvedValue(true);
const mockDefine = jest.fn().mockReturnValue({
  prototype: {},
  associate: null,
  findOne: jest.fn(),
});
const mockSequelize = { define: mockDefine };

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
  },
}));

jest.unstable_mockModule('crypto', () => ({
  default: {
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'a'.repeat(64) }),
    createHash: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue('hashed_key'),
      }),
    }),
  },
}));

const ApiKeyModel = (await import('../../models/ApiKey.js')).default;

describe('ApiKey Model', () => {
  let ApiKey;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({
      prototype: {},
      associate: null,
      findOne: jest.fn(),
    });
    ApiKey = ApiKeyModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'ApiKey',
        expect.any(Object),
        expect.objectContaining({ tableName: 'api_keys', underscored: true }),
      );
    });

    it('should define name as required', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.name.allowNull).toBe(false);
    });

    it('should define active with default true', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.active.defaultValue).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('generateKey() should return key with ak_ prefix', () => {
      const key = ApiKey.generateKey();
      expect(key).toMatch(/^ak_/);
    });

    it('digestKey() should return hashed value', () => {
      const digest = ApiKey.digestKey('ak_testkey');
      expect(digest).toBe('hashed_key');
    });
  });

  describe('Instance Methods', () => {
    let apiKey;

    beforeEach(() => {
      apiKey = Object.create(ApiKey.prototype);
      apiKey.expires_at = null;
      apiKey.active = true;
      apiKey.last_used_at = null;
      apiKey.save = mockSave;
    });

    it('isExpired() should return falsy when no expiry', () => {
      expect(apiKey.isExpired()).toBeFalsy();
    });

    it('isExpired() should return true when past expiry', () => {
      apiKey.expires_at = new Date('2020-01-01');
      expect(apiKey.isExpired()).toBe(true);
    });

    it('isExpired() should return false when future expiry', () => {
      apiKey.expires_at = new Date('2099-01-01');
      expect(apiKey.isExpired()).toBe(false);
    });

    it('touchLastUsed() should update last_used_at', async () => {
      await apiKey.touchLastUsed();
      expect(apiKey.last_used_at).toBeInstanceOf(Date);
      expect(mockSave).toHaveBeenCalledWith({ fields: ['last_used_at'] });
    });

    it('revoke() should set active to false', async () => {
      await apiKey.revoke();
      expect(apiKey.active).toBe(false);
      expect(mockSave).toHaveBeenCalledWith({ fields: ['active'] });
    });
  });

  describe('Associations', () => {
    it('should define associate function', () => {
      expect(typeof ApiKey.associate).toBe('function');
    });
  });
});
