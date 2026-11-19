const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  actorName: { type: String, default: null },
  action: { type: String, required: true, enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE'], index: true },
  entityType: { type: String, required: true, enum: ['USER', 'DOCTOR', 'PATIENT'], index: true },
  entityId: { type: String, default: null, index: true },
  summary: { type: String, required: true, maxlength: 500 },
  changedFields: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

auditSchema.pre(['updateOne', 'updateMany', 'replaceOne', 'findOneAndUpdate', 'findOneAndReplace', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function () { throw new Error('Audit logs are immutable'); });
[auditSchema.index({ createdAt: -1 }), auditSchema.index({ actorId: 1, createdAt: -1 }), auditSchema.index({ action: 1, createdAt: -1 }), auditSchema.index({ entityType: 1, createdAt: -1 })];
module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);
