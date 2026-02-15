export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('vehicles', 'trim', { type: Sequelize.STRING });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('vehicles', 'trim');
}
