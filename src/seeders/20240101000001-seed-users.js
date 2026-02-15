import bcrypt from 'bcryptjs';

const hashPassword = async (pw) => bcrypt.hash(pw, 10);

export async function up(queryInterface) {
  const now = new Date();
  const pw = await hashPassword('password123'); // pragma: allowlist secret
  await queryInterface.bulkInsert('users', [
    {
      email: 'customer@example.com',
      encrypted_password: pw,
      first_name: 'Alice',
      last_name: 'Johnson',
      phone: '+15551001000',
      role: 0,
      sign_in_count: 0,
      otp_required_for_login: false,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'officer@example.com',
      encrypted_password: pw,
      first_name: 'Bob',
      last_name: 'Smith',
      phone: '+15551002000',
      role: 1,
      sign_in_count: 0,
      otp_required_for_login: false,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'underwriter@example.com',
      encrypted_password: pw,
      first_name: 'Carol',
      last_name: 'Williams',
      phone: '+15551003000',
      role: 2,
      sign_in_count: 0,
      otp_required_for_login: false,
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('users', null, {});
}
