const cors = require('cors');

function createCorsMiddleware(allowedOrigins) {
  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const origins = String(allowedOrigins || '')
        .split(',')
        .map((value) => value.trim().replace(/\/+$/, ''))
        .filter(Boolean);
      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      if (origins.includes(normalizedOrigin)) return callback(null, true);
      const error = new Error('Origin not allowed by CORS');
      error.statusCode = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}

module.exports = createCorsMiddleware;
