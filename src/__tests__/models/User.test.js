// src/__tests__/models/User.test.js
import { jest } from '@jest/globals';

// Mock sequelize and bcrypt before importing
const mockDefine = jest.fn().mockReturnValue({
  prototype: {},
  beforeCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  associate: null,
});
const mockSequelize = { define: mockDefine };

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
  default: {
    hash: jest.fn().mockResolvedValue('$2a$12$hashedpassword'),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

jest.unstable_mockModule('../../config/app.js', () => ({
  default: {
    password: { saltRounds: 1 },
  },
}));

const UserModel = (await import('../../models/User.js')).default;

describe('User Model', () => {
  let User;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDefine.mockReturnValue({
      prototype: {},
      beforeCreate: jest.fn(),
      beforeUpdate: jest.fn(),
      associate: null,
    });
    User = UserModel(mockSequelize);
  });

  describe('Model Definition', () => {
    it('should define model with correct table name', () => {
      expect(mockDefine).toHaveBeenCalledWith(
        'User',
        expect.any(Object),
        expect.objectContaining({
          tableName: 'users',
          underscored: true,
          timestamps: true,
        }),
      );
    });

    it('should define email field as required and unique', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.email.allowNull).toBe(false);
      expect(fields.email.unique).toBe(true);
    });

    it('should define role with default customer value', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.role.defaultValue).toBe(0);
    });

    it('should define all Devise trackable fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.sign_in_count).toBeDefined();
      expect(fields.current_sign_in_at).toBeDefined();
      expect(fields.last_sign_in_at).toBeDefined();
      expect(fields.current_sign_in_ip).toBeDefined();
      expect(fields.last_sign_in_ip).toBeDefined();
    });

    it('should define all Devise confirmable fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.confirmation_token).toBeDefined();
      expect(fields.confirmed_at).toBeDefined();
      expect(fields.confirmation_sent_at).toBeDefined();
    });

    it('should define all Devise lockable fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.failed_attempts).toBeDefined();
      expect(fields.locked_at).toBeDefined();
      expect(fields.unlock_token).toBeDefined();
    });

    it('should define MFA fields', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.otp_secret).toBeDefined();
      expect(fields.otp_required_for_login).toBeDefined();
      expect(fields.otp_backup_codes).toBeDefined();
    });

    it('should define first_name and last_name as required', () => {
      const fields = mockDefine.mock.calls[0][1];
      expect(fields.first_name.allowNull).toBe(false);
      expect(fields.last_name.allowNull).toBe(false);
    });
  });

  describe('Static Constants', () => {
    it('should define ROLES with correct values', () => {
      expect(User.ROLES).toEqual({
        customer: 0,
        loan_officer: 1,
        underwriter: 2,
      });
    });

    it('should define ROLE_NAMES as inverse of ROLES', () => {
      expect(User.ROLE_NAMES[0]).toBe('customer');
      expect(User.ROLE_NAMES[1]).toBe('loan_officer');
      expect(User.ROLE_NAMES[2]).toBe('underwriter');
    });

    it('should define ROLE_SCOPES for each role', () => {
      expect(User.ROLE_SCOPES.customer).toContain('applications:read');
      expect(User.ROLE_SCOPES.customer).toContain('applications:write');
      expect(User.ROLE_SCOPES.loan_officer).toContain('applications:review');
      expect(User.ROLE_SCOPES.underwriter).toContain('applications:approve');
      expect(User.ROLE_SCOPES.underwriter).toContain('applications:reject');
    });

    it('should give customer profile read/write scopes', () => {
      expect(User.ROLE_SCOPES.customer).toContain('profile:read');
      expect(User.ROLE_SCOPES.customer).toContain('profile:write');
    });

    it('should give staff users:read scope', () => {
      expect(User.ROLE_SCOPES.loan_officer).toContain('users:read');
      expect(User.ROLE_SCOPES.underwriter).toContain('users:read');
    });
  });

  describe('Instance Methods', () => {
    let userInstance;

    beforeEach(() => {
      userInstance = Object.create(User.prototype);
      userInstance.first_name = 'John';
      userInstance.last_name = 'Doe';
      userInstance.role = 0;
      userInstance.email = 'john@example.com';
      userInstance.encrypted_password = '$2a$12$hashedpassword';
    });

    it('fullName() should return first and last name', () => {
      expect(userInstance.fullName()).toBe('John Doe');
    });

    it('roleName() should return string role name', () => {
      expect(userInstance.roleName()).toBe('customer');
      userInstance.role = 1;
      expect(userInstance.roleName()).toBe('loan_officer');
      userInstance.role = 2;
      expect(userInstance.roleName()).toBe('underwriter');
    });

    it('isCustomer() should return true for role 0', () => {
      expect(userInstance.isCustomer()).toBe(true);
      expect(userInstance.isLoanOfficer()).toBe(false);
      expect(userInstance.isUnderwriter()).toBe(false);
    });

    it('isLoanOfficer() should return true for role 1', () => {
      userInstance.role = 1;
      expect(userInstance.isLoanOfficer()).toBe(true);
      expect(userInstance.isCustomer()).toBe(false);
    });

    it('isUnderwriter() should return true for role 2', () => {
      userInstance.role = 2;
      expect(userInstance.isUnderwriter()).toBe(true);
      expect(userInstance.isCustomer()).toBe(false);
    });

    it('scopes() should return role-specific scopes', () => {
      const scopes = userInstance.scopes();
      expect(scopes).toContain('applications:read');
      expect(scopes).toContain('applications:write');
    });

    it('scopes() should return empty array for unknown role', () => {
      userInstance.role = 99;
      expect(userInstance.scopes()).toEqual([]);
    });

    it('jwtPayload() should return correct payload', () => {
      const payload = userInstance.jwtPayload();
      expect(payload).toEqual({
        role: 'customer',
        email: 'john@example.com',
        scopes: expect.arrayContaining(['applications:read']),
      });
    });

    it('validPassword() should call bcrypt.compare', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      await userInstance.validPassword('password123');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2a$12$hashedpassword');
    });
  });

  describe('Hooks', () => {
    it('should register beforeCreate hook', () => {
      const hookFn = User.beforeCreate;
      expect(hookFn).toHaveBeenCalled();
    });

    it('should register beforeUpdate hook', () => {
      const hookFn = User.beforeUpdate;
      expect(hookFn).toHaveBeenCalled();
    });
  });

  describe('Associations', () => {
    it('should define associate function', () => {
      expect(typeof User.associate).toBe('function');
    });
  });
});
