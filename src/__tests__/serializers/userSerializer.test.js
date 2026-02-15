// src/__tests__/serializers/userSerializer.test.js
const { serializeUser, serializeUserList } = await import('../../serializers/userSerializer.js');

describe('userSerializer', () => {
  const mockUser = {
    id: 1,
    email: 'test@test.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 0,
    encrypted_password: 'hashed', //pragma: allowlist secret
    otp_secret: 'secret', //pragma: allowlist secret
    otp_backup_codes: ['a', 'b'],
    unlock_token: 'tok',
    toJSON: function () {
      return { ...this, toJSON: undefined };
    },
  };

  describe('serializeUser', () => {
    it('should return JSONAPI structure', () => {
      const result = serializeUser(mockUser);
      expect(result.data.id).toBe(1);
      expect(result.data.type).toBe('user');
      expect(result.data.attributes.email).toBe('test@test.com');
    });

    it('should exclude sensitive fields', () => {
      const result = serializeUser(mockUser);
      expect(result.data.attributes.encrypted_password).toBeUndefined();
      expect(result.data.attributes.otp_secret).toBeUndefined();
      expect(result.data.attributes.otp_backup_codes).toBeUndefined();
      expect(result.data.attributes.unlock_token).toBeUndefined();
    });

    it('should handle plain objects without toJSON', () => {
      const plain = { id: 2, email: 'a@b.com', encrypted_password: 'x' };
      const result = serializeUser(plain);
      expect(result.data.id).toBe(2);
      expect(result.data.attributes.encrypted_password).toBeUndefined();
    });
  });

  describe('serializeUserList', () => {
    it('should serialize array with meta', () => {
      const result = serializeUserList([mockUser], { total: 1, page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
