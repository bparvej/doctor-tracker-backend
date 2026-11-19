const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp } = require('../src/app');

function appWithEnv() {
  return buildApp({ env: {
    NODE_ENV: 'test', PORT: 5000,
    MONGODB_URI: 'mongodb://127.0.0.1:27017/doctor_tracker_test',
    JWT_SECRET: 'test-secret-with-at-least-thirty-two-bytes',
    JWT_EXPIRES_IN: '1h', CLIENT_URL: 'http://localhost:3000'
  } });
}

test('health endpoint returns service status', async () => {
  const app = appWithEnv();
  const response = await app.inject({ method: 'GET', url: '/api/health' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().success, true);
  await app.close();
});

test('login validation rejects invalid payload', async () => {
  const app = appWithEnv();
  const response = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'bad', password: '1' } });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().success, false);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
  await app.close();
});

test('protected doctor route rejects missing token', async () => {
  const app = appWithEnv();
  const response = await app.inject({ method: 'GET', url: '/api/doctors' });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().success, false);
  await app.close();
});

test('audit route rejects unauthenticated access', async () => {
  const app = appWithEnv();
  const response = await app.inject({ method: 'GET', url: '/api/audit-logs' });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test('CORS allows configured frontend origin for preflight', async () => {
  const app = buildApp({ env: {
    NODE_ENV: 'test', PORT: 5000,
    MONGODB_URI: 'mongodb://127.0.0.1:27017/doctor_tracker_test',
    JWT_SECRET: 'test-secret-with-at-least-thirty-two-bytes',
    JWT_EXPIRES_IN: '1h',
    CLIENT_URL: 'https://example.vercel.app, https://doctor-tracker-frontend-sandy.vercel.app'
  } });
  const response = await app.inject({
    method: 'OPTIONS',
    url: '/api/auth/login',
    headers: {
      origin: 'https://doctor-tracker-frontend-sandy.vercel.app',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,authorization'
    }
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'https://doctor-tracker-frontend-sandy.vercel.app');
  await app.close();
});

test('CORS rejects origins outside the configured allowlist', async () => {
  const app = appWithEnv();
  const response = await app.inject({
    method: 'OPTIONS',
    url: '/api/auth/login',
    headers: {
      origin: 'https://untrusted.example',
      'access-control-request-method': 'POST'
    }
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});
