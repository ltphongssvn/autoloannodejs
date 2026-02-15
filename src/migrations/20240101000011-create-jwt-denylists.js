export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('jwt_denylists', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    jti: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    exp: { type: Sequelize.DATE, allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
  await queryInterface.addIndex('jwt_denylists', ['jti'], { unique: true });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('jwt_denylists');
}
