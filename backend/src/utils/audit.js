const AuditLog = require('../modules/audit/audit.model');

function requestContext(request) {
  return {
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'] || null
  };
}
async function writeAudit({ request, actor, action, entityType, entityId, summary, changedFields = [], metadata = {} }) {
  const context = request ? requestContext(request) : {};
  await AuditLog.create({
    actorId: actor?.id || actor?._id || null,
    actorName: actor?.name || null,
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    summary,
    changedFields,
    metadata,
    ...context
  });
}
module.exports = { writeAudit, requestContext };
