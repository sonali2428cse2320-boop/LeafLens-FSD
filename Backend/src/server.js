const app = require("./app");
const env = require("./config/env");
const { connectDB, disconnectDB } = require("./config/db");

const {
  startScheduler,
  stopScheduler,
} = require("./services/care/scheduler.runner");

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(
        `🌿 LeafLens API running on http://localhost:${env.PORT}`
      );

      console.log(`Environment: ${env.NODE_ENV}`);
      startScheduler();
    });
  } catch (error) {
    console.error("Failed to start LeafLens API:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log("HTTP server closed.");
    }

    stopScheduler();

    await disconnectDB();

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error.message);

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();