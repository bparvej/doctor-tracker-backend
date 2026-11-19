require('dotenv').config();
const { buildApp } = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');

async function start() {
  const app = buildApp();
  try {
    await connectDatabase(app.config.MONGODB_URI);
    await app.listen({ port: app.config.PORT, host: '0.0.0.0' });
    const shutdown = async (signal) => {
      app.log.info({ signal }, 'Shutting down');
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}
start();
