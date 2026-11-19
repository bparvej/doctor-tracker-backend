const fp = require('fastify-plugin');

async function jwtPlugin(fastify, options) {
  await fastify.register(require('@fastify/jwt'), {
    secret: options.secret,
    sign: { expiresIn: options.expiresIn }
  });
}
module.exports = fp(jwtPlugin);
