export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('vehicles', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      unique: true,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    make: { type: Sequelize.STRING(100) },
    model: { type: Sequelize.STRING(100) },
    year: { type: Sequelize.INTEGER },
    vin: { type: Sequelize.STRING(17) },
    trim: { type: Sequelize.STRING },
    mileage: { type: Sequelize.INTEGER },
    condition: { type: Sequelize.STRING(20) },
    estimated_value: { type: Sequelize.DECIMAL(12, 2) },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('vehicles', ['application_id'], { unique: true });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('vehicles');
}
