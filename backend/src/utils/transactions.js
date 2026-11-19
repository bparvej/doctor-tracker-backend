const mongoose = require('mongoose');

async function runWithFallback(work, options = {}) {
  const connection = mongoose.connection;
  if (!connection.db) throw new Error('Database is not connected');
  try {
    const session = await connection.startSession();
    try {
      let result;
      await session.withTransaction(async () => { result = await work(session); }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
      return { result, transactional: true };
    } finally { await session.endSession(); }
  } catch (error) {
    if (options.fallback && (error.codeName === 'IllegalOperation' || /Transaction numbers|replica set|transactions are not supported/i.test(error.message))) {
      return { result: await options.fallback(), transactional: false };
    }
    throw error;
  }
}
module.exports = { runWithFallback };
