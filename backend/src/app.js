const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const { errorHandler } = require('./middleware/error-handler');
const createCorsMiddleware = require('./plugins/cors');

function buildApp(options = {}) {
  const config = options.env || env.loadEnv();
  const app = express();
  app.config = config;
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    res.setHeader('x-request-id', req.id);
    next();
  });
  app.use(helmet());
  app.use(createCorsMiddleware(config.CLIENT_URL));
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use(express.json({ limit: '100kb' }));

  const configuredApiUrl = config.API_URL || config.PUBLIC_API_URL || config.RENDER_EXTERNAL_URL;
  const serverUrl = (configuredApiUrl || (config.NODE_ENV === 'development' ? `http://localhost:${config.PORT}` : '')).replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const openapi = {
    openapi: '3.0.3',
    info: { title: 'Doctor Tracker API', version: '1.0.0', description: 'Authenticated REST API for managing users, doctors, patients, dashboard data and immutable audit logs.' },
    ...(serverUrl ? { servers: [{ url: serverUrl }] } : {}),
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/health': { get: { security: [], responses: { 200: { description: 'Service health status' } } } },
      '/api/auth/login': { post: { security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } } } } } }, responses: { 200: { description: 'Authenticated user and JWT token' } } } },
      '/api/auth/logout': { post: { responses: { 200: { description: 'Logout acknowledged' } } } },
      '/api/auth/me': { get: { responses: { 200: { description: 'Current authenticated user' } } } },
      '/api/users': { get: { responses: { 200: { description: 'Paginated users' } } }, post: { requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password', 'role'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 }, role: { type: 'string', enum: ['ADMIN', 'VIEWER'] }, isActive: { type: 'boolean' } } } } } }, responses: { 201: { description: 'Created user' } } } },
      '/api/users/{id}': { get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'User' } } }, put: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated user' } } }, delete: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted user' } } } },
      '/api/doctors': { get: { responses: { 200: { description: 'Paginated doctors' } } }, post: { responses: { 201: { description: 'Created doctor' } } } },
      '/api/doctors/{id}': { get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Doctor' } } }, put: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated doctor' } } }, delete: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted doctor' } } } },
      '/api/doctors/{id}/patients': { get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Doctor patients' } } }, post: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Created patient' } } } },
      '/api/patients': { get: { responses: { 200: { description: 'Paginated patients' } } }, post: { responses: { 201: { description: 'Created patient' } } } },
      '/api/patients/{id}': { get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Patient' } } }, put: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated patient' } } }, delete: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted patient' } } } },
      '/api/dashboard/stats': { get: { responses: { 200: { description: 'Dashboard statistics' } } } },
      '/api/audit-logs': { get: { responses: { 200: { description: 'Paginated audit logs' } } } },
      '/api/audit-logs/{id}': { get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Audit log' } } } }
    }
  };

  app.get(['/api/health', '/health'], (req, res) => res.status(200).json({ success: true, data: { status: 'ok', service: 'doctor-tracker-backend', timestamp: new Date().toISOString() } }));
  app.get(['/api/docs/json', '/docs/json'], (req, res) => res.json(openapi));
  app.use(['/api/docs', '/docs'], swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true, swaggerOptions: { persistAuthorization: true } }));

  app.use('/api/auth', require('./modules/auth/auth.routes'));
  app.use('/api/users', require('./modules/auth/user.routes'));
  app.use('/api/doctors', require('./modules/doctors/doctor.routes'));
  app.use('/api/patients', require('./modules/patients/patient.routes'));
  app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
  app.use('/api/audit-logs', require('./modules/audit/audit.routes'));

  app.use((req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' }, requestId: req.id }));
  app.use(errorHandler);
  return app;
}
module.exports = { buildApp };
