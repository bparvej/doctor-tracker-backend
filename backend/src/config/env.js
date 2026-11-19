const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

function loadEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 5000),
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    API_URL: process.env.API_URL,
    PUBLIC_API_URL: process.env.PUBLIC_API_URL,
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL
  };
  if (env.NODE_ENV === 'production') {
    const missing = requiredInProduction.filter((key) => !env[key]);
    if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (!env.JWT_SECRET) env.JWT_SECRET = 'development-only-change-this-secret';
  if (!env.MONGODB_URI) env.MONGODB_URI = 'mongodb://127.0.0.1:27017/doctor_tracker';
  return env;
}
module.exports = { loadEnv };
