# Technical Architecture

## Architecture

Express application entry (`server.js`) establishes Mongoose before accepting traffic. `src/app.js` composes Helmet, CORS, rate limiting, JSON parsing, route modules, Swagger UI, and centralized Express error handling. Modules separate routes, controllers, services, and Mongoose models. The Express error middleware maps validation, malformed ObjectIds, duplicate keys, JWT failures, and application errors into the existing JSON response contract.

## Schemas

- **User:** name, email, passwordHash, role (`ADMIN`|`VIEWER`), isActive, timestamps. PasswordHash is excluded by `select: false`. User management is restricted to ADMIN and audits create/update/delete operations.
- **Doctor:** name, specialization, hospital, phone, unique email, createdBy, updatedBy, timestamps.
- **Patient:** name, age, gender, phone, optional email, condition, required doctorId reference, createdBy, updatedBy, timestamps.
- **AuditLog:** actor snapshot and ID, action, entity type/ID, summary, changed fields, limited metadata, IP, user agent and createdAt.

Deletion policy: a doctor cannot be deleted while associated patients exist. The application returns HTTP 409 and the patient count. Reassign or delete patients first.

## Authentication

Bearer JWTs are created and verified with `jsonwebtoken`. Tokens contain only subject and role. Every protected request verifies the token, reloads the current user, rejects inactive/deleted users, and verifies the token role matches the database role. Logout is an audit event, not token revocation; clients must discard the token.

## Authorization

Express middleware derives actor identity from `req.user.sub`, never body fields. Mutations require ADMIN; read routes are authenticated. VIEWER is valid and has read access where no mutation requirement is declared.

## Audit design

Audit entries are generated in business controllers/services and are never publicly writable. Audit mutation hooks reject updates and deletes. Standalone MongoDB deployments cannot provide a cross-document atomic guarantee; replica-set transactions remain the preferred consistency mechanism.

## Indexes

Doctors: text name/specialization/hospital, createdAt, specialization/hospital/createdAt. Patients: text name/condition, doctorId/createdAt, condition/createdAt, createdAt. Users: unique/lowercase email. Audit: createdAt, actor/createdAt, action/createdAt, entity/createdAt.

## Query design

Listing endpoints use bounded limits (maximum 100), skip/limit pagination, and lean reads where possible. Search uses MongoDB text indexes, exact categorical filters use indexed fields, and dashboard aggregation uses server-side `$group`, `$lookup`, `$sort`, `$limit`, and `$project`.

## Error handling

The Express centralized error middleware maps malformed JSON, validation failures, malformed ObjectIds, duplicate keys, JWT failures, and application errors. Production responses omit internal stack traces and database details.

## Technical decisions

1. **MongoDB indexing and aggregation:** compound/text indexes support doctor and patient search, while dashboard aggregation runs on MongoDB instead of loading full collections into memory.
2. **Stateless JWT plus RBAC:** `jsonwebtoken` provides stateless authentication and database role/status revalidation preserves account revocation behavior. Immutable audit logging records privileged and authentication events.

## CORS integration

The Express CORS middleware reads exact allowed origins from `CLIENT_URL` and supports comma-separated origins. Production deployments must set an explicit origin and must not use a wildcard. Preflight `OPTIONS` requests are handled for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`, with `Content-Type` and `Authorization` allowed headers.

## Swagger and public endpoints

Swagger reads `API_URL`, then `PUBLIC_API_URL`, then Render's `RENDER_EXTERNAL_URL`. The canonical URLs are `/api/docs` and `/api/docs/json`; public aliases are `/docs` and `/docs/json`. Health is available at `/api/health` and `/health`.
