const path = require("node:path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

function getNumber(name, fallback) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function getBoolean(name, fallback = false) {
  const rawValue = process.env[name];
  if (rawValue == null) {
    return fallback;
  }
  return rawValue === "true" || rawValue === "1";
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  serverPort: getNumber("SERVER_PORT", 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  sessionSecret: process.env.SESSION_SECRET || "dev-only-session-secret",
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: getNumber("DB_PORT", 5432),
    ssl: getBoolean("DB_SSL", false),
  },
};

module.exports = { env };
