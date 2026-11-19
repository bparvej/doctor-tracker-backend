const fastify = require('fastify');
const env = require('./config/env');
const { errorHandler } = require('./middleware/error-handler');

function buildApp(options = {}) {
  const config = options.env || env.loadEnv();
  const app = fastify({ logger: { level: config.NODE_ENV === 'production' ? 'info' : 'debug' } });
  app.setErrorHandler(errorHandler);
  app.decorate('config', config);
  app.register(require('@fastify/helmet'));
  app.register(require('@fastify/rate-limit'), { global: true, max: 100, timeWindow: '1 minute' });
  app.register(require('./plugins/cors'), { allowedOrigins: config.CLIENT_URL });
  app.register(require('./plugins/jwt'), { secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRES_IN });
  const configuredApiUrl = config.API_URL || config.PUBLIC_API_URL || config.RENDER_EXTERNAL_URL;
  const swaggerServerUrl = (configuredApiUrl || (config.NODE_ENV === 'development' ? `http://localhost:${config.PORT}` : '')).replace(/\/api\/?$/, '').replace(/\/+$/, '');
  app.register(require('@fastify/swagger'), { openapi: { info: { title: 'Doctor Tracker API', version: '1.0.0', description: 'Authenticated REST API for managing users, doctors, patients, dashboard data and immutable audit logs.' }, servers: swaggerServerUrl ? [{ url: swaggerServerUrl }] : undefined, components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } }, security: [{ bearerAuth: [] }] } });
  app.register(require('@fastify/swagger-ui'), { routePrefix: '/api/docs', uiConfig: { docExpansion: 'list', deepLinking: true } });

  app.get('/api/health', { logLevel: 'silent' }, async () => ({ success: true, data: { status: 'ok', service: 'doctor-tracker-backend', timestamp: new Date().toISOString() } }));
  app.register(require('./modules/auth/auth.routes'), { prefix: '/api/auth' });
  app.register(require('./modules/auth/user.routes'), { prefix: '/api/users' });
  app.register(require('./modules/doctors/doctor.routes'), { prefix: '/api/doctors' });
  app.register(require('./modules/patients/patient.routes'), { prefix: '/api/patients' });
  app.register(require('./modules/dashboard/dashboard.routes'), { prefix: '/api/dashboard' });
  app.register(require('./modules/audit/audit.routes'), { prefix: '/api/audit-logs' });
  return app;
}
module.exports = { buildApp };
