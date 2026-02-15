export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('documents', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    application_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'applications', key: 'id' },
      onDelete: 'CASCADE',
    },
    doc_type: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    file_name: { type: Sequelize.STRING(255) },
    file_url: { type: Sequelize.TEXT },
    file_size: { type: Sequelize.INTEGER },
    content_type: { type: Sequelize.STRING(100) },
    status: { type: Sequelize.INTEGER, defaultValue: 0 },
    uploaded_at: { type: Sequelize.DATE },
    verified_at: { type: Sequelize.DATE },
    verified_by_id: { type: Sequelize.BIGINT, references: { model: 'users', key: 'id' } },
    rejection_note: { type: Sequelize.TEXT },
    request_note: { type: Sequelize.TEXT },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('documents', ['application_id']);
  await queryInterface.addIndex('documents', ['status']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('documents');
}
