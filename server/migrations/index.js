const { DataTypes } = require("sequelize");

async function addColumnIfMissing(queryInterface, tableName, columnName, spec) {
  const tableDescription = await queryInterface.describeTable(tableName);

  if (!tableDescription[columnName]) {
    await queryInterface.addColumn(tableName, columnName, spec);
  }
}

async function backfillTaskPositions(sequelize) {
  await sequelize.query(`
    UPDATE tasks AS target
    SET position = subquery.row_number - 1
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS row_number
      FROM tasks
      WHERE position = 0
    ) AS subquery
    WHERE target.id = subquery.id AND target.position = 0
  `);
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

  await addColumnIfMissing(queryInterface, "tasks", "deleted_at", {
    type: DataTypes.DATE,
    allowNull: true,
  });

  const tableDescription = await queryInterface.describeTable("tasks");
  const positionIsNew = !tableDescription.position;

  await addColumnIfMissing(queryInterface, "tasks", "position", {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  if (positionIsNew) {
    await backfillTaskPositions(sequelize);
  }
}

module.exports = { runMigrations };
