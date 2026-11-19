const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, index: true },
  specialization: { type: String, required: true, trim: true, maxlength: 100, index: true },
  hospital: { type: String, required: true, trim: true, maxlength: 150, index: true },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, versionKey: false });

doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ specialization: 1, hospital: 1, createdAt: -1 });
module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
