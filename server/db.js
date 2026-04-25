const { Sequelize } = require("sequelize");
const { env } = require("./config/env");

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to the database.");
}

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
