const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, index: true },
  age: { type: Number, required: true, min: 0, max: 150 },
  gender: { type: String, required: true, enum: ['MALE', 'FEMALE', 'OTHER'], index: true },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, trim: true, lowercase: true, default: null, match: /^(?:[^\s@]+@[^\s@]+\.[^\s@]+)?$/ },
  condition: { type: String, required: true, trim: true, maxlength: 150, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, versionKey: false });

patientSchema.index({ name: 'text', condition: 'text' });
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });
module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
