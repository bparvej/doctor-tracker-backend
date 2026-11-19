const bcrypt = require('bcrypt');
const User = require('./user.model');
const { appError } = require('../../middleware/error-handler');

async function login(email, password) {
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) throw appError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) throw appError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  return user;
}
async function findById(id) { return User.findById(id); }
async function hashPassword(password) { return bcrypt.hash(password, 12); }
module.exports = { login, findById, hashPassword };
