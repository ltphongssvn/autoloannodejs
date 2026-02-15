export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('api_keys', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    name: { type: Sequelize.STRING(100), allowNull: false },
    key_digest: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    last_used_at: { type: Sequelize.DATE },
    expires_at: { type: Sequelize.DATE },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('api_keys', ['key_digest'], { unique: true });
  await queryInterface.addIndex('api_keys', ['user_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('api_keys');
}
