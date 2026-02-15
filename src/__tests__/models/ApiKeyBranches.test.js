// src/__tests__/models/ApiKeyBranches.test.js
import { jest } from '@jest/globals';

const mockSave = jest.fn().mockResolvedValue(true);
const mockFindOne = jest.fn();

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
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'b'.repeat(64) }),
    createHash: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue('digest_value'),
      }),
    }),
  },
}));

const ApiKeyModel = (await import('../../models/ApiKey.js')).default;

describe('ApiKey authenticate branches', () => {
  let ApiKey;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockDefine = jest.fn().mockReturnValue({
      prototype: {},
      associate: null,
      findOne: mockFindOne,
    });
    ApiKey = ApiKeyModel({ define: mockDefine });
  });

  it('authenticate() returns null when key not found', async () => {
    mockFindOne.mockResolvedValue(null);
    const result = await ApiKey.authenticate('ak_badkey');
    expect(result).toBeNull();
  });

  it('authenticate() returns null when key is expired', async () => {
    const expiredKey = {
      expires_at: new Date('2020-01-01'),
      isExpired: function () {
        return this.expires_at && new Date() > new Date(this.expires_at);
      },
      touchLastUsed: mockSave,
    };
    mockFindOne.mockResolvedValue(expiredKey);
    const result = await ApiKey.authenticate('ak_expiredkey');
    expect(result).toBeNull();
  });

  it('authenticate() returns key and touches last_used on success', async () => {
    const validKey = {
      expires_at: new Date('2099-01-01'),
      isExpired: function () {
        return this.expires_at && new Date() > new Date(this.expires_at);
      },
      touchLastUsed: jest.fn().mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(validKey);
    const result = await ApiKey.authenticate('ak_goodkey');
    expect(result).toBe(validKey);
    expect(validKey.touchLastUsed).toHaveBeenCalled();
  });
});
