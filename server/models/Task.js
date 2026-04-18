const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        isIn: [["high", "medium", "low"]],
      },
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    share_token: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    recurrence: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "none",
      validate: {
        isIn: [["none", "daily", "weekly", "monthly"]],
      },
    },
    recurrence_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    createdAt: "created_at",
    updatedAt: false,
  }
);

if (!User.associations.tasks) {
  User.hasMany(Task, { foreignKey: "user_id", as: "tasks" });
}

if (!Task.associations.user) {
  Task.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

module.exports = Task;
