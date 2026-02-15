export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('documents', 'request_note', { type: Sequelize.TEXT });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('documents', 'request_note');
}
