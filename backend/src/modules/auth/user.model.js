const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMIN', 'VIEWER'], default: 'ADMIN', required: true, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true, versionKey: false });

userSchema.methods.toSafeObject = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, isActive: this.isActive, createdAt: this.createdAt, updatedAt: this.updatedAt };
};
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
