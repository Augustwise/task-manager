const { DataTypes } = require("sequelize");

async function addColumnIfMissing(queryInterface, tableName, columnName, spec) {
  const tableDescription = await queryInterface.describeTable(tableName);

  if (!tableDescription[columnName]) {
    await queryInterface.addColumn(tableName, columnName, spec);
  }
}

async function runMigrations(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  await addColumnIfMissing(queryInterface, "tasks", "recurrence", {
    type: DataTypes.STRING(8),
    allowNull: false,
    defaultValue: "none",
  });

  await addColumnIfMissing(queryInterface, "tasks", "recurrence_end_date", {
    type: DataTypes.DATEONLY,
    allowNull: true,
  });
}

module.exports = { runMigrations };
