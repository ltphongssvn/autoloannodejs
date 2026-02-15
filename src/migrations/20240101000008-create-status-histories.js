export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('status_histories', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: { type: Sequelize.BIGINT, references: { model: 'users', key: 'id' } },
    from_status: { type: Sequelize.STRING(30) },
    to_status: { type: Sequelize.STRING(30), allowNull: false },
    comment: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('status_histories', ['application_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('status_histories');
}
