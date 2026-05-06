const { Sequelize } = require("sequelize");
const { env } = require("./config/env");

const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    dialectOptions: env.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    logging: false,
  }
);

module.exports = sequelize;
