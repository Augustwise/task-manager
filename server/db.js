const { Sequelize } = require("sequelize");
const { Client } = require("pg");
const { env } = require("./config/env");

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

async function ensureDatabase() {
  if (!SAFE_IDENTIFIER.test(env.db.name)) {
    throw new Error(
      `Invalid DB_NAME "${env.db.name}". Use only letters, numbers, and underscores.`
    );
  }

  const client = new Client({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: "postgres",
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [env.db.name]
    );
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${env.db.name}"`);
      console.log(`Created database "${env.db.name}"`);
    }
  } finally {
    await client.end();
  }
}

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
module.exports.ensureDatabase = ensureDatabase;
