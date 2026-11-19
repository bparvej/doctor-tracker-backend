require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { loadEnv } = require('../src/config/env');
const User = require('../src/modules/auth/user.model');
const authService = require('../src/modules/auth/auth.service');

async function run() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@doctortracker.local').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) { console.log('Demo admin already exists:', email); }
  else {
    const passwordHash = await authService.hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!');
    await User.create({ name: process.env.SEED_ADMIN_NAME || 'Demo Administrator', email, passwordHash, role: 'ADMIN', isActive: true });
    console.log('Created demo admin:', email);
  }
  const viewerEmail = (process.env.SEED_VIEWER_EMAIL || 'viewer@doctortracker.local').toLowerCase();
  const existingViewer = await User.findOne({ email: viewerEmail });
  if (existingViewer) { console.log('Demo viewer already exists:', viewerEmail); }
  else {
    const viewerPasswordHash = await authService.hashPassword(process.env.SEED_VIEWER_PASSWORD || 'ViewMe123!');
    await User.create({ name: process.env.SEED_VIEWER_NAME || 'Demo Viewer', email: viewerEmail, passwordHash: viewerPasswordHash, role: 'VIEWER', isActive: true });
    console.log('Created demo viewer:', viewerEmail);
  }
  await disconnectDatabase();
}
run().catch((error) => { console.error(error.message); process.exit(1); });
