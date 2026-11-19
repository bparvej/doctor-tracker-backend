# Technical Architecture

## Architecture

Fastify application entry (`server.js`) establishes Mongoose before accepting traffic. `src/app.js` composes plugins and module routes. Modules separate routes, controllers, services and Mongoose models. Centralized error handling converts validation, JWT, cast, duplicate-key and application errors into a consistent JSON response.

## Schemas

- **User:** name, email, passwordHash, role (`ADMIN`|`VIEWER`), isActive, timestamps. PasswordHash is excluded by `select: false`. User management is restricted to ADMIN and audits create/update/delete operations.
- **Doctor:** name, specialization, hospital, phone, unique email, createdBy, updatedBy, timestamps.
- **Patient:** name, age, gender, phone, optional email, condition, required doctorId reference, createdBy, updatedBy, timestamps.
- **AuditLog:** actor snapshot and ID, action, entity type/ID, summary, changed fields, limited metadata, IP, user agent and createdAt.

Deletion policy: a doctor cannot be deleted while associated patients exist. The application returns HTTP 409 and the patient count. Reassign or delete patients first.

## Authentication

Bearer JWTs are used. Tokens contain only the subject and role. Every protected request verifies the token, reloads the current user, rejects inactive/deleted users and verifies the token role matches the database role. Tokens are never stored or placed in audit metadata. Logout is an audit event, not token revocation; clients must discard the token.

## Authorization

Routes derive actor identity from `request.user.sub`, never body fields. Mutations require ADMIN; read routes are authenticated. VIEWER is a valid role and has read access where no mutation requirement is declared.

## Audit design

Audit entries are generated in service/controller business operations and are never publicly writable. Audit mutation hooks reject updates and deletes. Critical operations can use `runWithFallback`: transaction writes are attempted on replica sets and should include business and audit writes; a documented fallback may use best-effort sequential writes on standalone MongoDB. Standalone deployments cannot provide an atomic cross-document guarantee.

## Indexes

Doctors: text name/specialization/hospital, createdAt, specialization/hospital/createdAt. Patients: text name/condition, doctorId/createdAt, condition/createdAt, createdAt. Users: unique/lowercase email. Audit: createdAt, actor/createdAt, action/createdAt, entity/createdAt.

## Query design

Listing endpoints use bounded limits (maximum 100), skip/limit pagination and projected/lean reads where possible. Search uses MongoDB text indexes, while exact categorical filters use indexed fields. Aggregation uses server-side `$group`, `$lookup`, `$sort` and `$limit`.

## Error handling

The Fastify centralized handler maps validation, malformed ObjectIds, duplicate keys, JWT failures and application errors. Production responses omit internal stack traces and database details.

## Technical decisions

1. **Fastify over Express:** lower framework overhead, native schema validation and typed plugin lifecycle.
2. **Bearer JWT:** stateless scaling and simple separate-frontend integration; logout is client-side plus audit-only.
3. **Text indexes plus exact filters:** supports user-friendly search without loading collections into memory.
4. **Mongoose lean reads:** reduces hydration overhead for list responses.

## Performance considerations

Monitor text index cardinality and maintain compound indexes for common dashboard and audit filters. Consider cursor pagination for very large histories. Dashboard count and aggregation endpoints can use MongoDB and should be cached if traffic increases.

## CORS integration

The Fastify CORS plugin reads the exact allowed origins from `CLIENT_URL` and supports comma-separated origins. Production deployments must set an explicit origin and must not use a wildcard. Preflight `OPTIONS` requests are handled for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`, with `Content-Type` and `Authorization` allowed headers. The backend route prefix is `/api`; frontend API bases should therefore end in `/api`, while service endpoints begin with resource paths such as `/auth/login` or `/doctors`.

## Swagger documentation

Swagger reads `API_URL` at application startup. This public API base controls the OpenAPI `servers` entry, allowing `/api/docs` to execute requests against the deployed backend. Local fallback is `http://localhost:<PORT>`; production deployment should set `API_URL=https://doctor-tracker-backend-gfj8.onrender.com/api`.
