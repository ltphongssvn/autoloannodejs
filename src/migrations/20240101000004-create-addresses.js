export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('addresses', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    address_type: { type: Sequelize.STRING(20), defaultValue: 'residential' },
    street_address: { type: Sequelize.STRING(255) },
    street_address_2: { type: Sequelize.STRING(255) },
    city: { type: Sequelize.STRING(100) },
    state: { type: Sequelize.STRING(2) },
    zip_code: { type: Sequelize.STRING(10) },
    years_at_address: { type: Sequelize.INTEGER },
    months_at_address: { type: Sequelize.INTEGER },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('addresses', ['application_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('addresses');
}
