// src/__tests__/models/UserBranches.test.js
import { jest } from '@jest/globals';

const mockHash = jest.fn().mockResolvedValue('$2a$12$newhash');
const mockCompare = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    DATE: 'DATE',
    BOOLEAN: 'BOOLEAN',
    TEXT: 'TEXT',
  },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: { hash: mockHash, compare: mockCompare },
}));

jest.unstable_mockModule('../../config/app.js', () => ({
  default: { password: { saltRounds: 1 } },
}));

let beforeCreateHook;
let beforeUpdateHook;

const mockDefine = jest.fn().mockImplementation((_name, _fields, _opts) => {
  const model = {
    prototype: {},
    beforeCreate: jest.fn((fn) => {
      beforeCreateHook = fn;
    }),
    beforeUpdate: jest.fn((fn) => {
      beforeUpdateHook = fn;
    }),
    associate: null,
  };
  return model;
});
const mockSequelize = { define: mockDefine };

const UserModel = (await import('../../models/User.js')).default;

describe('User Hook Branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    beforeCreateHook = null;
    beforeUpdateHook = null;
    UserModel(mockSequelize);
  });

  describe('beforeCreate hook', () => {
    it('should hash plain password', async () => {
      const user = { encrypted_password: 'plaintext', phone: '7145551001' }; // pragma: allowlist secret
      await beforeCreateHook(user);
      expect(mockHash).toHaveBeenCalledWith('plaintext', 1);
      expect(user.encrypted_password).toBe('$2a$12$newhash');
    });

    it('should not re-hash already hashed password', async () => {
      const user = { encrypted_password: '$2a$12$alreadyhashed', phone: '7145551001' };
      await beforeCreateHook(user);
      expect(mockHash).not.toHaveBeenCalled();
    });

    it('should normalize phone with + prefix', async () => {
      const user = { encrypted_password: '$2a$12$hashed', phone: '+1-714-555-1001' };
      await beforeCreateHook(user);
      expect(user.phone).toBe('+17145551001');
    });

    it('should normalize phone without + prefix', async () => {
      const user = { encrypted_password: '$2a$12$hashed', phone: '714-555-1001' };
      await beforeCreateHook(user);
      expect(user.phone).toBe('7145551001');
    });

    it('should skip phone normalization if no phone', async () => {
      const user = { encrypted_password: '$2a$12$hashed', phone: null };
      await beforeCreateHook(user);
      expect(user.phone).toBeNull();
    });
  });

  describe('beforeUpdate hook', () => {
    it('should hash password if changed', async () => {
      const user = {
        encrypted_password: 'newplain', // pragma: allowlist secret
        phone: '7145551001',
        changed: jest.fn((field) => field === 'encrypted_password'),
      };
      await beforeUpdateHook(user);
      expect(mockHash).toHaveBeenCalledWith('newplain', 1);
    });

    it('should not hash if password not changed', async () => {
      const user = {
        encrypted_password: '$2a$12$hashed',
        phone: '7145551001',
        changed: jest.fn().mockReturnValue(false),
      };
      await beforeUpdateHook(user);
      expect(mockHash).not.toHaveBeenCalled();
    });

    it('should normalize phone if changed with +', async () => {
      const user = {
        encrypted_password: '$2a$12$hashed',
        phone: '+1-800-555-1234',
        changed: jest.fn((field) => field === 'phone'),
      };
      await beforeUpdateHook(user);
      expect(user.phone).toBe('+18005551234');
    });

    it('should normalize phone if changed without +', async () => {
      const user = {
        encrypted_password: '$2a$12$hashed',
        phone: '800-555-1234',
        changed: jest.fn((field) => field === 'phone'),
      };
      await beforeUpdateHook(user);
      expect(user.phone).toBe('8005551234');
    });

    it('should skip phone normalization if phone not changed', async () => {
      const user = {
        encrypted_password: '$2a$12$hashed',
        phone: '7145551001',
        changed: jest.fn().mockReturnValue(false),
      };
      await beforeUpdateHook(user);
      // phone unchanged
      expect(user.phone).toBe('7145551001');
    });

    it('should skip phone normalization if phone is null', async () => {
      const user = {
        encrypted_password: '$2a$12$hashed',
        phone: null,
        changed: jest.fn((field) => field === 'phone'),
      };
      await beforeUpdateHook(user);
      expect(user.phone).toBeNull();
    });
  });
});
