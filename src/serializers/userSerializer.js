// src/serializers/userSerializer.js
// Maps: app/serializers/user_serializer.rb
const EXCLUDED_FIELDS = ['encrypted_password', 'otp_secret', 'otp_backup_codes', 'unlock_token'];

export const serializeUser = (user) => {
  const data = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  EXCLUDED_FIELDS.forEach((f) => delete data[f]);
  return { data: { id: data.id, type: 'user', attributes: data } };
};

export const serializeUserList = (users, meta) => ({
  data: users.map((u) => serializeUser(u).data),
  meta: { total: meta.total, page: meta.page, limit: meta.limit },
});

export default { serializeUser, serializeUserList };
