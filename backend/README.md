# Doctor Tracker Backend

Production-oriented Fastify REST API for the separate Next.js Doctor Tracker frontend.

## Features

- JWT authentication and ADMIN/VIEWER role authorization
- Doctor and patient CRUD
- Server-side search, filters, sorting and bounded pagination
- Dashboard MongoDB aggregations
- Immutable audit logging
- Swagger/OpenAPI documentation
- CORS, Helmet, rate limiting and centralized validation/errors
- Docker and Docker Compose support

## Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Docker Desktop optional

## Installation

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

## API documentation

When the server is running:

- Swagger UI: **http://localhost:5000/api/docs**
- OpenAPI JSON: **http://localhost:5000/api/docs/json**
- Health: **http://localhost:5000/api/health**

Log in with the seeded demo account, copy the returned `data.token`, then use Swagger's **Authorize** button with `Bearer <token>`.

## Demo account and automatic seeding

Defaults are `admin@doctortracker.local` / `ChangeMe123!`. Override `SEED_ADMIN_*` variables before seeding.

The application runs `scripts/seed-demo.js` before starting in both `npm start` and `npm run dev`. Docker startup uses the same behavior. The seeder is idempotent: it creates missing demo data and does not replace existing records.

Seeded demo data includes:

- 1 administrator account
- 5 doctors with varied specializations
- 10 patients assigned to those doctors

Seed manually with:

```bash
npm run seed:demo
npm run seed:admin
```

MongoDB must be reachable before the backend or seeder starts.

## Docker

From the repository root:

```bash
docker compose up --build
```

Set `JWT_SECRET` and `CLIENT_URL` in a local `.env` or shell for non-demo use.

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| GET/POST | `/api/doctors` | Protected / ADMIN create |
| GET/PUT/DELETE | `/api/doctors/:id` | Protected / ADMIN mutations |
| GET/POST | `/api/doctors/:id/patients` | Protected / ADMIN create |
| GET/POST | `/api/patients` | Protected / ADMIN create |
| GET/PUT/DELETE | `/api/patients/:id` | Protected / ADMIN mutations |
| GET | `/api/dashboard/stats` | ADMIN |
| GET | `/api/audit-logs` | ADMIN |
| GET | `/api/audit-logs/:id` | ADMIN |
| GET | `/api/health` | Public |

## Render deployment

Create a Web Service with `backend` as root directory, Node 20 runtime, `npm install` build and `npm start` start command. Configure `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `CLIENT_URL`, and `NODE_ENV=production`. Use MongoDB Atlas and add Render's outbound network to the Atlas access allowlist.

## Tests

```bash
npm test
```
