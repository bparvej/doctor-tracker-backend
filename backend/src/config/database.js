const mongoose = require('mongoose');

async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });
  return mongoose.connection;
}
async function disconnectDatabase() {
  await mongoose.disconnect();
}
module.exports = { connectDatabase, disconnectDatabase };
