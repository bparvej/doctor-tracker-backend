function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || '10', 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
module.exports = { parsePagination, escapeRegex };
