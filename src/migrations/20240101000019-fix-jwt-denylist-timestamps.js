export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('jwt_denylists', 'created_at', {
    type: Sequelize.DATE,
    allowNull: true,
  });
  await queryInterface.changeColumn('jwt_denylists', 'updated_at', {
    type: Sequelize.DATE,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('jwt_denylists', 'created_at', {
    type: Sequelize.DATE,
    allowNull: false,
  });
  await queryInterface.changeColumn('jwt_denylists', 'updated_at', {
    type: Sequelize.DATE,
    allowNull: false,
  });
}
