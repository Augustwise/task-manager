const sequelize = require("./db");
const { ensureDatabase } = require("./db");
require("./models/Task");
require("./models/Subtask");
const { env } = require("./config/env");
const { createSessionStore } = require("./config/session");
const { createApp } = require("./app");
const { runMigrations } = require("./migrations");

const prepareDatabase = env.db.ensureDatabase ? ensureDatabase() : Promise.resolve();

prepareDatabase
  .then(() => sequelize.authenticate())
  .then(() => sequelize.sync())
  .then(() => runMigrations(sequelize))
  .then(() => {
    const sessionStore = createSessionStore(sequelize);

    return sessionStore.sync().then(() => sessionStore);
  })
  .then((sessionStore) => {
    const app = createApp({ sessionStore });

    console.log("Connected to database");
    app.listen(env.serverPort, () => console.log(`Server running on port ${env.serverPort}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });
