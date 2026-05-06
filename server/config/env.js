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

function getRequired(name) {
  const rawValue = process.env[name];
  if (rawValue == null || rawValue === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Refusing to start to avoid falling back to the system PostgreSQL defaults. ` +
        `Set ${name} in your .env file (see .env.example).`
    );
  }
  return rawValue;
}

function getTrustProxy(name, fallback = false) {
  const rawValue = process.env[name];

  if (rawValue == null) {
    return fallback;
  }

  const normalizedValue = rawValue.trim();
  if (!normalizedValue) {
    return fallback;
  }

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  const parsedNumber = Number.parseInt(normalizedValue, 10);
  if (!Number.isNaN(parsedNumber) && String(parsedNumber) === normalizedValue) {
    return parsedNumber;
  }

  return normalizedValue;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  serverPort: getNumber("SERVER_PORT", 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  trustProxy: getTrustProxy("TRUST_PROXY", false),
  sessionSecret: process.env.SESSION_SECRET || "dev-only-session-secret",
  db: {
    name: getRequired("DB_NAME"),
    user: getRequired("DB_USER"),
    password: getRequired("DB_PASSWORD"),
    host: getRequired("DB_HOST"),
    port: getNumber("DB_PORT", 5432),
    ssl: getBoolean("DB_SSL", false),
  },
};

module.exports = { env };
