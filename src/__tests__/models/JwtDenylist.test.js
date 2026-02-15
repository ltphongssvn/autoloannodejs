// src/__tests__/models/JwtDenylist.test.js
import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockDestroy = jest.fn();
const mockDefine = jest.fn().mockReturnValue({
  prototype: {},
  findOne: mockFindOne,
  create: mockCreate,
  destroy: mockDestroy,
});
const mockSequelize = { define: mockDefine };

jest.unstable_mockModule('sequelize', () => ({
  DataTypes: {
    BIGINT: 'BIGINT',
    STRING: 'STRING',
    DATE: 'DATE',
  },
  Op: { lt: Symbol('lt') },
}));

const JwtDenylistModel = (await import('../../models/JwtDenylist.js')).default;

describe('JwtDenylist Model', () => {
  let JwtDenylist;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({
      prototype: {},
      findOne: mockFindOne,
      create: mockCreate,
      destroy: mockDestroy,
    });
    JwtDenylist = JwtDenylistModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'JwtDenylist',
        expect.any(Object),
        expect.objectContaining({ tableName: 'jwt_denylists', timestamps: false }),
      );
    });

    it('should define jti as required and unique', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.jti.allowNull).toBe(false);
      expect(fields.jti.unique).toBe(true);
    });

    it('should define exp as required', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.exp.allowNull).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('isDenylisted() should return true when entry found', async () => {
      mockFindOne.mockResolvedValue({ jti: 'test-jti' });
      const result = await JwtDenylist.isDenylisted('test-jti');
      expect(result).toBe(true);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { jti: 'test-jti' } });
    });

    it('isDenylisted() should return false when not found', async () => {
      mockFindOne.mockResolvedValue(null);
      const result = await JwtDenylist.isDenylisted('unknown-jti');
      expect(result).toBe(false);
    });

    it('addToList() should create entry with date conversion', async () => {
      await JwtDenylist.addToList('test-jti', 1700000000);
      expect(mockCreate).toHaveBeenCalledWith({
        jti: 'test-jti',
        exp: new Date(1700000000 * 1000),
      });
    });

    it('cleanup() should destroy expired entries', async () => {
      await JwtDenylist.cleanup();
      expect(mockDestroy).toHaveBeenCalledWith({
        where: expect.objectContaining({ exp: expect.any(Object) }),
      });
    });
  });
});
