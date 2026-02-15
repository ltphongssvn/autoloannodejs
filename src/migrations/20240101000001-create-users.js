// Maps: db/migrate/*_devise_create_users.rb
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    encrypted_password: { type: Sequelize.STRING(255), allowNull: false, defaultValue: '' },
    first_name: { type: Sequelize.STRING(100) },
    last_name: { type: Sequelize.STRING(100) },
    phone: { type: Sequelize.STRING(20) },
    role: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    sign_in_count: { type: Sequelize.INTEGER, defaultValue: 0 },
    current_sign_in_at: { type: Sequelize.DATE },
    last_sign_in_at: { type: Sequelize.DATE },
    current_sign_in_ip: { type: Sequelize.STRING },
    last_sign_in_ip: { type: Sequelize.STRING },
    failed_attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
    locked_at: { type: Sequelize.DATE },
    unlock_token: { type: Sequelize.STRING },
    otp_secret: { type: Sequelize.STRING },
    otp_required_for_login: { type: Sequelize.BOOLEAN, defaultValue: false },
    otp_backup_codes: { type: Sequelize.JSONB },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('users', ['email'], { unique: true });
  await queryInterface.addIndex('users', ['role']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}
