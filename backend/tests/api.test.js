const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { buildApp } = require('../src/app');

function appWithEnv(overrides = {}) {
  return buildApp({ env: {
    NODE_ENV: 'test', PORT: 5000,
    MONGODB_URI: 'mongodb://127.0.0.1:27017/doctor_tracker_test',
    JWT_SECRET: 'test-secret-with-at-least-thirty-two-bytes',
    JWT_EXPIRES_IN: '1h',
    CLIENT_URL: 'http://localhost:3000',
    ...overrides
  } });
}

test('health endpoints return service status', async () => {
  const app = appWithEnv();
  for (const url of ['/api/health', '/health']) {
    const response = await request(app).get(url);
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
  }
});

test('login validation rejects invalid payload', async () => {
  const response = await request(appWithEnv()).post('/api/auth/login').send({ email: 'bad', password: '1' });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('protected doctor route rejects missing token', async () => {
  const response = await request(appWithEnv()).get('/api/doctors');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('audit route rejects unauthenticated access', async () => {
  const response = await request(appWithEnv()).get('/api/audit-logs');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('CORS allows configured frontend origin for preflight', async () => {
  const app = appWithEnv({ CLIENT_URL: 'https://example.vercel.app, https://doctor-tracker-frontend-sandy.vercel.app' });
  const response = await request(app).options('/api/auth/login').set('Origin', 'https://doctor-tracker-frontend-sandy.vercel.app').set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'content-type,authorization');
  assert.equal(response.status, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'https://doctor-tracker-frontend-sandy.vercel.app');
});

test('CORS rejects origins outside the configured allowlist', async () => {
  const response = await request(appWithEnv()).options('/api/auth/login').set('Origin', 'https://untrusted.example').set('Access-Control-Request-Method', 'POST');
  assert.equal(response.status, 403);
});

test('Swagger exposes configured public server URL', async () => {
  const app = appWithEnv({ API_URL: 'https://doctor-tracker-backend-gfj8.onrender.com/api' });
  const response = await request(app).get('/api/docs/json');
  assert.equal(response.status, 200);
  assert.equal(response.body.servers[0].url, 'https://doctor-tracker-backend-gfj8.onrender.com');
  const alias = await request(app).get('/docs/json');
  assert.equal(alias.status, 200);
  assert.equal(alias.body.servers[0].url, 'https://doctor-tracker-backend-gfj8.onrender.com');
});

test('Swagger falls back to Render external URL', async () => {
  const app = appWithEnv({ NODE_ENV: 'production', RENDER_EXTERNAL_URL: 'https://doctor-tracker-backend-gfj8.onrender.com', CLIENT_URL: 'https://doctor-tracker-frontend-sandy.vercel.app' });
  const response = await request(app).get('/docs/json');
  assert.equal(response.status, 200);
  assert.equal(response.body.servers[0].url, 'https://doctor-tracker-backend-gfj8.onrender.com');
});

test('user management routes require authentication and ADMIN RBAC', async () => {
  const response = await request(appWithEnv()).get('/api/users');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
