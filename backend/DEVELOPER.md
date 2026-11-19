# Developer Onboarding

## Requirements

- Node.js 20 or newer
- npm 10+
- MongoDB 7+, or Docker Desktop
- Git

## Start locally

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

Open `http://localhost:5000/api/docs`.

Without Docker, run MongoDB on `127.0.0.1:27017`. With Docker:

```bash
docker compose up --build
cd backend && npm run seed:admin
```

Set seed credentials in `backend/.env` when not using compose.

`npm start`, `npm run dev`, and Docker startup run the idempotent demo seeder before launching Fastify. Existing demo records are not replaced. Seeded demo credentials are `admin@doctortracker.local` / `ChangeMe123!` unless overridden with `SEED_ADMIN_*` variables.

## Environment

Do not commit `.env`. Required production variables are `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `JWT_EXPIRES_IN`, `PORT` and `NODE_ENV`. JWT secrets should be at least 32 random bytes.

## Folder conventions

- `src/config`: environment and database
- `src/plugins`: framework integrations
- `src/middleware`: authentication, authorization and errors
- `src/modules/<name>`: model, routes, controller and service
- `src/utils`: shared pagination and audit helpers
- `scripts`: operational scripts
- `tests`: Node test runner suites

## Adding a module

Create model, service, controller and routes files. Register the route prefix in `src/app.js`. Keep HTTP concerns in controllers/routes, database operations in services and field shape in models.

## Validation and security

Use Fastify JSON schemas for body validation and `additionalProperties: false` to prevent mass assignment. Never accept `createdBy`, `updatedBy`, `role`, `actorId` or `passwordHash` from clients. Build ObjectIds and filters in services.

## Audit logging

Call `writeAudit` only after a successful business mutation. Store names, changed field names and non-sensitive summaries—not passwords, tokens or complete patient records. Add audit filtering only through `/api/audit-logs` and restrict access to ADMIN.

## Testing APIs

1. Start MongoDB and the server.
2. `POST /api/auth/login` with demo credentials.
3. Copy `data.token`.
4. Send `Authorization: Bearer <token>`.
5. Use Swagger UI for interactive request/response testing.

## Exceptions

Controllers and service operations should catch or rethrow through Fastify's centralized handler. Throw `appError(statusCode, message, code, details)` for expected errors. Do not expose stack traces or internal database messages.

## Git workflow

Create a feature branch, keep commits focused, run `npm test`, inspect `git diff`, and open a pull request. Never commit `.env`, logs or secrets.

## Troubleshooting

- `ECONNREFUSED 27017`: start MongoDB or Docker compose.
- `Missing required environment variables`: set production variables in the host environment.
- `Origin not allowed`: add the exact frontend origin to `CLIENT_URL`; multiple origins may be comma-separated.
- Duplicate key: email or unique field already exists.
- Invalid ObjectId: verify IDs in the response, not frontend-generated values.

## CORS and frontend integration

Set `CLIENT_URL` to the exact deployed frontend origin:

```text
CLIENT_URL=https://doctor-tracker-frontend-sandy.vercel.app
```

Multiple origins may be separated by commas, for example:

```text
CLIENT_URL=https://doctor-tracker-frontend-sandy.vercel.app,http://localhost:3000
```

Do not use `*` for production CORS. Allowed methods are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`; allowed headers are `Content-Type` and `Authorization`. The API base URL is `/api`, so request paths must include `/api` only once, such as `/api/auth/login`.

## Swagger and public server URL

Set `API_URL` to the deployed public API base. Include `/api` when Swagger should execute routes through that base:

```text
API_URL=https://doctor-tracker-backend-gfj8.onrender.com/api
```

Locally, `API_URL=http://localhost:5000/api`. The Swagger configuration derives the server origin and route operations remain `/api/...`.

## User management and RBAC

`/api/users` is protected by authentication and the `ADMIN` role. `ADMIN` users can create, list, view, update and delete users. The API prevents an admin from deleting or deactivating their own account and prevents self role changes. `VIEWER` users may remain read-only and cannot access mutation or administration routes.
