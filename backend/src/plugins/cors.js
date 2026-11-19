const fp = require('fastify-plugin');

async function corsPlugin(fastify, options) {
  await fastify.register(require('@fastify/cors'), {
    origin(origin, callback) {
      const origins = (options.allowedOrigins || '').split(',').map((v) => v.trim()).filter(Boolean);
      if (!origin || origins.includes(origin)) return callback(null, true);
      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}
module.exports = fp(corsPlugin);
