export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('security_audit_logs', 'resource_type', {
    type: Sequelize.STRING(50),
  });
  await queryInterface.addColumn('security_audit_logs', 'resource_id', { type: Sequelize.BIGINT });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('security_audit_logs', 'resource_type');
  await queryInterface.removeColumn('security_audit_logs', 'resource_id');
}
