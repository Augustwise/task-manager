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
  databaseUrl: process.env.DATABASE_URL,
};

module.exports = { env };
