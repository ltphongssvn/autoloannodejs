export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('security_audit_logs', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.BIGINT, references: { model: 'users', key: 'id' } },
    event_type: { type: Sequelize.STRING(50), allowNull: false },
    ip_address: { type: Sequelize.STRING(45) },
    user_agent: { type: Sequelize.TEXT },
    metadata: { type: Sequelize.JSONB },
    success: { type: Sequelize.BOOLEAN, defaultValue: true },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('security_audit_logs', ['user_id']);
  await queryInterface.addIndex('security_audit_logs', ['event_type']);
  await queryInterface.addIndex('security_audit_logs', ['ip_address']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('security_audit_logs');
}
