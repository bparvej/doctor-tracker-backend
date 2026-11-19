const fp = require('fastify-plugin');

async function corsPlugin(fastify, options) {
  await fastify.register(require('@fastify/cors'), {
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const origins = (options.allowedOrigins || '')
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
module.exports = fp(corsPlugin);
