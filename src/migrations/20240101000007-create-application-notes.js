export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('application_notes', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    note: { type: Sequelize.TEXT, allowNull: false },
    internal: { type: Sequelize.BOOLEAN, defaultValue: false },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('application_notes', ['application_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('application_notes');
}
