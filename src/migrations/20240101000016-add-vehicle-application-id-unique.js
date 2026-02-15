export async function up(queryInterface) {
  await queryInterface.addConstraint('vehicles', {
    fields: ['application_id'],
    type: 'unique',
    name: 'vehicles_application_id_unique',
  });
}

export async function down(queryInterface) {
  await queryInterface.removeConstraint('vehicles', 'vehicles_application_id_unique');
}
