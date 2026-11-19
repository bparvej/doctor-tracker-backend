require('dotenv').config();
const http = require('http');
const { buildApp } = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');

async function start() {
  const app = buildApp();
  try {
    await connectDatabase(app.config.MONGODB_URI);
    const server = http.createServer(app);
    server.listen(app.config.PORT, '0.0.0.0', () => {
      console.log(`Doctor Tracker API listening on port ${app.config.PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`Shutting down: ${signal}`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
start();
