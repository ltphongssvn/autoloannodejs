export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('financial_infos', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    employment_status: { type: Sequelize.STRING(30) },
    employer_name: { type: Sequelize.STRING(255) },
    job_title: { type: Sequelize.STRING(255) },
    years_employed: { type: Sequelize.INTEGER },
    months_employed: { type: Sequelize.INTEGER },
    annual_income: { type: Sequelize.DECIMAL(12, 2) },
    monthly_income: { type: Sequelize.DECIMAL(10, 2) },
    income_type: { type: Sequelize.STRING(20) },
    credit_score: { type: Sequelize.INTEGER },
    monthly_expenses: { type: Sequelize.DECIMAL(10, 2) },
    other_income: { type: Sequelize.DECIMAL(10, 2) },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('financial_infos', ['application_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('financial_infos');
}
