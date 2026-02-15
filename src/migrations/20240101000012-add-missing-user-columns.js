export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'jti', { type: Sequelize.STRING });
  await queryInterface.addColumn('users', 'confirmation_token', { type: Sequelize.STRING });
  await queryInterface.addColumn('users', 'confirmed_at', { type: Sequelize.DATE });
  await queryInterface.addColumn('users', 'confirmation_sent_at', { type: Sequelize.DATE });
  await queryInterface.addColumn('users', 'unconfirmed_email', { type: Sequelize.STRING });
  await queryInterface.addColumn('users', 'reset_password_token', { type: Sequelize.STRING });
  await queryInterface.addColumn('users', 'reset_password_sent_at', { type: Sequelize.DATE });
  await queryInterface.addColumn('users', 'remember_created_at', { type: Sequelize.DATE });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('users', 'jti');
  await queryInterface.removeColumn('users', 'confirmation_token');
  await queryInterface.removeColumn('users', 'confirmed_at');
  await queryInterface.removeColumn('users', 'confirmation_sent_at');
  await queryInterface.removeColumn('users', 'unconfirmed_email');
  await queryInterface.removeColumn('users', 'reset_password_token');
  await queryInterface.removeColumn('users', 'reset_password_sent_at');
  await queryInterface.removeColumn('users', 'remember_created_at');
}
