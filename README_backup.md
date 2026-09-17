# Dotneet — Backend API

## Overview

The **Dotneet API** is the Express.js backend that powers the Dotneet Mini App. It handles:

- **Profile discovery and search** — Public `.neet` handle lookups
- **Wallet profile management** — Wallet-bound profile creation and retrieval
- **Health checks** — Database connectivity and service status
- **Rate limiting** — Protection against abuse (600 requests/min default for public reads)
- **CORS configuration** — Controlled origins for frontend and Nimiq Pay integration

The API is designed to be consumed by the Next.js frontend (running on Vercel) and directly by Nimiq Pay Mini Apps via HTTPS.

---

## Architecture

```
backend/
├── src/
│   ├── app.ts          ← Express app setup (middleware, routes, error handling)
│   ├── server.ts       ← Server entry point with graceful shutdown
│   ├── config/         ← Environment validation with Zod
│   ├── middleware/     ← CORS, rate limiting, error handling
│   ├── routes/         ← API routes (health, profiles, receipts)
│   └── utils/          ← Prisma client, logger, Zod validation schemas
├── prisma/
│   └── schema.prisma   ← Database model definitions (WalletProfile, ContributionReceipt, etc.)
├── package.json
├── .env                ← Environment variables (never commit)
└── tsconfig.json
```

### Key Design Decisions

| Concern | Solution |
|---------|----------|
| **Database** | PostgreSQL via Prisma ORM (Neon.tech free tier recommended) |
| **API Versioning** | Public v1 routes under `/api/v1/`, internal under `/api/` |
| **Error format** | `{ error: { code, message, details? } }` per `docs/04-DATA-AND-API.md` |
| **CORS** | Configurable origins; `*` for public v1 GET/OPTIONS, same-origin for writes |
| **Rate limiting** | 600/min for public reads, stricter limits for auth/write endpoints |
| **Shutdown** | Graceful SIGTERM/SIGINT with Prisma $disconnect and HTTP server close |

---

## Prerequisites

- **Node.js**: `>=22.13.0` (specified in `package.json engines`)
- **PostgreSQL**: Neon.tech account (free tier) or self-hosted PostgreSQL 18.4+
- **Git**: For cloning and branch management (`main-build` for frontend, `dotneet-api` for backend)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Mofe-Bankole/neet.git
cd neet
```

### 2. Checkout the Backend Branch

```bash
git checkout dotneet-api
```

The `dotneet-api` branch contains **only the backend API code**. The `main-build` branch contains the frontend (Next.js app).

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Configuration

Copy the example env and replace placeholder values:

```bash
cp .env.example .env
```

Then edit `.env` with your production values:

```
# PostgreSQL — Replace with your Neon connection string
DATABASE_URL="postgresql://dotneet:YOUR_PASSWORD_HERE@ep-name.region.aws.neon.tech/dotneet?schema=public"

# Server
PORT=3001
NODE_ENV=production

# CORS — Add your Vercel production domain and any other allowed origins
ALLOWED_ORIGINS="https://your-vercel-domain.vercel.app,http://localhost:3000"

# Rate limiting (in requests per window)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=600

# Logging
LOG_LEVEL=info
```

### 5. Prisma Migrations

Generate the Prisma client and run migrations:

```bash
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run deployment migrations against your DB
```

> 💡 **Important**: Back up your database before running migrations. The migration is additive and creates the new models (WalletProfile, AuthChallenge, WalletSession, ContributionReceipt, RateLimitBucket) while isolating legacy tables.

### 6. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm run build   # tsc
npm run start   # node dist/server.js
```

The server will start on `http://localhost:3001` (or whatever `PORT` you set).

### 7. Verify the API

```bash
# Health check
curl http://localhost:3001/api/health

# Profiles list
curl "http://localhost:3001/api/v1/profiles?limit=10"

# Handle availability
curl "http://localhost:3001/api/v1/handles/james.neet"
```

---

## API Endpoints

### Public v1 Routes (`/api/v1/`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/profiles` | Paginated list of public profiles | No |
| `GET` | `/api/v1/profiles/:handle` | Get single profile by handle | No |
| `GET` | `/api/v1/handles/:handle` | Check handle availability | No |
| `GET` | `/api/v1/receipts/:id` | Get single public receipt by ID | No |

### Internal Routes (`/api/`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/health` | Database connectivity check | No |
| `GET` | `/api/health/ready` | Readiness probe for K8s/LB | No |
| `GET` | `/api/health/live` | Liveness probe | No |
| `POST` | `/api/auth/challenge` | Generate Nimiq authentication challenge | Session cookie |
| `POST` | `/api/auth/verify` | Verify Nimiq challenge signature | Session cookie |
| `GET` | `/api/auth/session` | Check current session/profile | No |
| `POST` | `/api/auth/logout` | Revoke session | No |

### Error Response Format

All errors follow the contract from `docs/04-DATA-AND-API.md`:

```json
{
  "error": {
    "code": "NOT_FOUND",    // UNAUTHENTICATED(401), ORIGIN_REJECTED(403), NOT_FOUND(404), CONFLICT(409), RATE_LIMITED(429)
    "message": "Profile not found or has no published receipts",
    "details": { ... }       // Optional field-level errors for Zod validation
  }
}
```

Notable codes:
- `UNAUTHENTICATED` 401 — Missing/invalid session
- `ORIGIN_REJECTED` 403 — Invalid `Origin` header
- `NOT_FOUND` 404 — Profile/receipt not found
- `CONFLICT` 409 — Duplicate unique constraint
- `RATE_LIMITED` 429 — Too many requests
- `RPC_UNAVAILABLE` 503 — Database/Prisma error

---

## Deployment to Render

The backend is configured for easy deployment on [Render](https://render.com/):

1. **Create a new Web Service** on Render
2. **Connect the `dotneet-api` branch** from GitHub
3. **Set the Build Command**: `npm install && npm run build`
4. **Set the Start Command**: `npm run start`
5. **Add Environment Variables** in the Render dashboard (match `.env` keys):
   - `DATABASE_URL`
   - `PORT` (optional, default 3001)
   - `NODE_ENV` (set to `production`)
   - `ALLOWED_ORIGINS` (your Vercel domain + any other origins)
   - `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` (optional, defaults applied)
6. **Deploy** — Render will auto-detect the Node.js service

### Render Notes

- The backend listens on the `$PORT` env var (Render provides this automatically)
- Set `NODE_ENV=production` to enable optimized Prisma logging (only `['error']`)
- Add your Vercel domain to `ALLOWED_ORIGINS` so the frontend can fetch API data
- CORS is pre-configured to allow your production origin

---

## Database Schema Highlights

The Prisma schema (`prisma/schema.prisma`) defines these new models (legacy tables are isolated):

| Model | Key Fields |
|-------|------------|
| `WalletProfile` | `id` (CUID), `network`, `address`, `handle`, `displayName?`, `bio?`, `verifiedAt` |
| `AuthChallenge` | `id`, `network`, `address`, `message`, `bindingHash`, `expiresAt`, `usedAt?` |
| `WalletSession` | `id`, `tokenHash` (unique), `address`, `network`, `expiresAt`, `createdAt` |
| `ContributionReceipt` | `id`, `network`, `issuerId`, `recipientId`, `amountLuna` (BigInt), `statement`, `evidenceUrl?`, `paymentState` (DRAFT/CONFIRMED/...) |
| `RateLimitBucket` | `key` (hashed), `count`, `resetAt` |

Unique constraints: `(network, transactionHash)`, `(issuerId, idempotencyKey)`
Indexes: `(recipientId, publishedAt)`, `(issuerId, createdAt)`

---

## Development Workflow

```bash
# On main-build branch (frontend):
npm run dev          # Next.js with Turbopack
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript type check
npm test             # Run 41 unit tests

# On dotneet-api branch (backend):
npm run dev          # tsx watch -- hot reload
npm run build        # tsc
npm run prisma:migrate  # Deploy migrations
npm run lint         # ESLint on src/
npm run typecheck    # tsc --noEmit
```

---

## Important Notes

1. **Never commit `.env`** — It contains database credentials. The `.env.example` has placeholder values.
2. **Production RPC HTTPS** — Nimiq RPC URLs must use HTTPS in production (see `docs/04-DATA-AND-API.md:115`).
3. **Rate limiting** — Public v1 endpoints default to 600 requests/minute. Adjust via env vars if needed.
4. **CORS origin validation** — The API checks `Origin` header against `ALLOWED_ORIGINS`. Mobile/Nimiq Pay requests without an origin are allowed (for `window.nimiq` provider access).
5. **Database backups** — Before running `prisma:migrate`, back up your production database. Migrations are additive but irreversible without manual rollback.
6. **No reputation scores** — Dotneet does not compute trust scores or vanity metrics. Profile data is sourced from wallet-bound receipts only.

---

## Related Repositories

| Branch | Purpose |
|--------|---------|
| `main-build` | Frontend (Next.js, components, design system, UI) |
| `dotneet-api` | Backend API (Express.js, Prisma, routes, utils) |

Both branches share the same GitHub repo (`Mofe-Bankole/neet`) but are kept separate for concern isolation.