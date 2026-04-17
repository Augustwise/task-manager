const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { createSessionMiddleware } = require("./config/session");
const authRoutes = require("./modules/auth/routes");
const taskRoutes = require("./modules/tasks/routes");

function createApp({ sessionStore }) {
  const app = express();

  if (!sessionStore) {
    throw new Error("Session store is required");
  }

  app.set("trust proxy", env.trustProxy);
  app.use(express.json());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(createSessionMiddleware(sessionStore));
  app.use("/api", authRoutes);
  app.use("/api", taskRoutes);

  return app;
}

module.exports = { createApp };
