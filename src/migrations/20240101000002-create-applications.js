export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('applications', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    application_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    current_step: { type: Sequelize.INTEGER, defaultValue: 1 },
    loan_amount: { type: Sequelize.DECIMAL(12, 2) },
    down_payment: { type: Sequelize.DECIMAL(12, 2) },
    loan_term: { type: Sequelize.INTEGER },
    interest_rate: { type: Sequelize.DECIMAL(5, 2) },
    monthly_payment: { type: Sequelize.DECIMAL(10, 2) },
    dob: { type: Sequelize.DATEONLY },
    ssn_encrypted: { type: Sequelize.STRING },
    rejection_reason: { type: Sequelize.TEXT },
    signature_data: { type: Sequelize.TEXT },
    submitted_at: { type: Sequelize.DATE },
    decided_at: { type: Sequelize.DATE },
    signed_at: { type: Sequelize.DATE },
    agreement_accepted: { type: Sequelize.BOOLEAN, defaultValue: false },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('applications', ['user_id']);
  await queryInterface.addIndex('applications', ['status']);
  await queryInterface.addIndex('applications', ['application_number'], { unique: true });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('applications');
}
