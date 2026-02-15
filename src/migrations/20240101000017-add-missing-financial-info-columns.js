export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('financial_infos', 'months_employed', { type: Sequelize.INTEGER });
  await queryInterface.addColumn('financial_infos', 'monthly_income', {
    type: Sequelize.DECIMAL(10, 2),
  });
  await queryInterface.addColumn('financial_infos', 'other_income', {
    type: Sequelize.DECIMAL(10, 2),
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('financial_infos', 'months_employed');
  await queryInterface.removeColumn('financial_infos', 'monthly_income');
  await queryInterface.removeColumn('financial_infos', 'other_income');
}
