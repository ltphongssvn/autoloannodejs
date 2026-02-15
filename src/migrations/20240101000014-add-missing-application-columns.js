export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('applications', 'ssn_encrypted', { type: Sequelize.STRING });
  await queryInterface.addColumn('applications', 'signature_data', { type: Sequelize.TEXT });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('applications', 'ssn_encrypted');
  await queryInterface.removeColumn('applications', 'signature_data');
}
