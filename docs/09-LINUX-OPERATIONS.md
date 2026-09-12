# Dotneet — Linux Setup and Operations

**Revision:** 1.1 · **Prepared:** 11 September 2026. Commands are instructions for the receiving operator; they were not all executed by this documentation agent. Public deployment is not authorized by this handoff.

## Runtime and project root

Use Linux with a maintained Node.js release satisfying **Node >=22.13.0**, npm, and PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`). The supplied local database uses Docker Engine with Compose v2 and PostgreSQL18.4; an installed native PostgreSQL server is an alternative. Install prerequisites using your environment's supported package/version manager. Do not reuse `node_modules` copied from macOS; install from the lockfile on Linux.

Run these from the handed-over project root, the directory containing `package.json`, `prisma/`, `src/` and `.env.example`:

```bash
node --version
npm --version
npm ci
npm run prisma:generate
cp .env.example .env
```

If `.env` already exists, review it rather than overwrite it. Select the correct Node executable before installing; an older default shell Node can fail even on a CLI help request. Next.js/Prisma runtime compatibility cannot be inferred from a different bundled runtime used by another agent.

Read `AGENTS.md` and the installed Next.js documentation before modifying framework behavior. Use Node route handlers and the existing Prisma 5/PostgreSQL stack.

## Configuration

Edit `.env` locally. It is ignored by Git; `.env.example` contains only placeholders/local development settings.

| Variable | Meaning / default |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string; example `postgresql://dotneet:replace-with-local-password@127.0.0.1:54329/dotneet?schema=public` |
| `POSTGRES_PASSWORD` | Replace the local example password before first Compose startup; must match the URL-encoded password in DATABASE_URL |
| `APP_ORIGIN` | Exact browser origin; local `http://localhost:3000`; no path/trailing slash; production requires HTTPS |
| `NIMIQ_NETWORK` | `testnet` default or explicitly configured `mainnet` |
| `NIMIQ_RPC_URL` | Reliable history-indexed RPC for that same network; empty default disables verification, not a bypass |
| `NIMIQ_MIN_CONFIRMATIONS` | Positive integer; default 10 observed inclusion confirmations |
| `DOTNEET_TEST_DATABASE_URL` | Required explicit loopback connection to a database named exactly `dotneet_test`; tests reject other names/hosts |
| `DOTNEET_BUILD_DIR` | Optional Next.js build output directory; tests use `.next-integration` |

Prisma/Next.js load `.env` for their workflows. Shell tools such as `psql` do not automatically load it. For shell database operations, set the required environment variables securely or use PostgreSQL service configuration; do not print credentials or commit them.

`NIMIQ_RPC_URL` must use HTTPS in production. Nonproduction permits HTTP only for localhost/127.0.0.1, which supports the simulated test RPC. The service verifies its reported network before checking a transaction. A configured testnet app requires a testnet wallet; a client-side label cannot switch the wallet's actual network.

## Start a real PostgreSQL development database

The supplied `compose.yaml` uses PostgreSQL18.4, a named persistent volume, and a host binding restricted to **127.0.0.1:54329**. Set a local password in both POSTGRES_PASSWORD and DATABASE_URL before first startup; use a URL-safe password or URL-encode it in the connection string.

```bash
docker compose version
npm run db:local
docker compose ps
npm run db:deploy
npm run prisma:generate
npm run dev -- --hostname 127.0.0.1 --port 3000
```

`npm run db:local` runs `docker compose up -d db`. The database continues in the background. Check that the container is ready before migrating. Open `http://localhost:3000` to match APP_ORIGIN. If you use127.0.0.1 in the browser instead, change APP_ORIGIN to that exact origin and restart the app.

The named volume persists across normal stops and `docker compose down`. To stop the database without deleting its data:

```bash
docker compose stop db
```

Do not use `docker compose down -v` as routine shutdown; it deletes the development volume. Changing POSTGRES_PASSWORD after initialization does not automatically rotate an existing database role password. Update credentials through an explicit database operation, or deliberately rebuild only a disposable database after preserving needed data.

A native PostgreSQL installation is equally valid: create an empty development database and role, set its DATABASE_URL, then run the same migration/generation/dev commands. Use the existing-database procedure below for pre-existing tables/history. Keep the server bound appropriately and do not expose the database port to the public internet.

The earlier socket-emulated development database was removed after concurrent-client correctness failures. It is not a supported setup or a basis for validation. Use actual PostgreSQL for local application and integration checks.

## Local page inventory and expected behavior

| URL | What it provides |
|---|---|
| `/` | Public landing page |
| `/preview` | Fictional interactive profile/payment/receipt states; no wallet or payment calls |
| `/design-system` | Browsable design foundations and components |
| `/app` | Wallet authentication, claim/edit profile, own sent/received receipts |
| `/acknowledge?to=<handle>` | Contribution draft creation |
| `/<handle>` | Public profile and published receipt history |
| `/receipts/<id>` | Participant or public receipt inspection and permitted actions |
| `/api` | Public API documentation page |
| `/api/health` | Database connectivity check; does not validate RPC or Nimiq Pay |

An ordinary browser can inspect public content and the fictional sample. Live wallet approval requires Nimiq Pay. A missing RPC leaves independent verification unavailable and must never produce a fake success. Newly claimed real profiles have real empty states, not sample contributions.

## Nimiq Pay on a local device

1. Put the development machine and device on the same trusted LAN.
2. Set APP_ORIGIN to the exact URL the phone will use, for example `http://192.168.1.50:3000`, and restart the app. Substitute the actual development-machine address.
3. Start Next.js with LAN access:

```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

4. Open that URL through Nimiq Pay's Mini Apps custom URL facility. Configure Nimiq Pay for testnet and obtain testnet NIM using its documented development workflow.
5. Set a reliable matching testnet RPC before checking an actual test transfer. Retain the default confirmation policy unless deliberately testing another documented value.
6. Exercise two test wallets through claim, payment, signature, private receipt, recipient publication and unpublication. Record device/app versions and the exact tested network.

Do not expose the local database port to the LAN. Plain LAN HTTP is not a secure browser context: Clipboard/UUID APIs may be unavailable, so use implemented fallbacks or local HTTPS. Keep origin validation intact. [Official local Mini App guidance](https://nimiq.dev/mini-apps/development/load-local-mini-app).

## Migration history

The repository includes two migrations:

1. `202609110001_legacy_baseline`: creates the original six legacy tables, indexes and relationships.
2. `202609110002_contribution_receipts`: adds WalletProfile, AuthChallenge, WalletSession, ContributionReceipt and RateLimitBucket, including attempt token, network-scoped uniqueness and receipt foreign keys.

The second migration does not convert or delete legacy data. New receipt relations use restrictive deletion behavior; do not delete a profile to remove contribution history.

### Empty database

Run `npm run db:deploy`; both migrations should apply in order. Then inspect:

```bash
npx prisma migrate status
```

### Existing database with exactly the legacy schema

Do not run baseline SQL against existing tables or mark it applied merely to suppress an error. First back up and compare the actual schema with the baseline, including table/column types, constraints, indexes and foreign keys. Also inspect any existing `_prisma_migrations` history.

One reproducible comparison uses a separate **empty disposable reference database**. The operator supplies its Prisma URL as `DOTNEET_BASELINE_REFERENCE_URL` and the target Prisma URL as `DOTNEET_DB_URL`. Also supply `DOTNEET_BASELINE_REFERENCE_PG_URL` for PostgreSQL CLI tools: it points to the same reference database but omits Prisma-only query parameters such as `schema=public`. PostgreSQL's `psql`, `pg_dump` and `pg_restore` reject unsupported connection parameters. These examples assume the `public` schema; configure the search path deliberately for any other schema. The following writes only to the reference database until the explicit resolve/deploy step:

```bash
psql "$DOTNEET_BASELINE_REFERENCE_PG_URL" -v ON_ERROR_STOP=1 -f prisma/migrations/202609110001_legacy_baseline/migration.sql
npx prisma migrate diff --from-url "$DOTNEET_DB_URL" --to-url "$DOTNEET_BASELINE_REFERENCE_URL" --exit-code
```

For this Prisma version, diff exit0 means no differences, exit2 means differences, exit1 means error. Any difference/error requires investigation; do not resolve the baseline as applied. Ensure connection URLs select the same intended schema.

Only after a verified exact legacy match, appropriate backup and an authorized target change:

```bash
DATABASE_URL="$DOTNEET_DB_URL" npx prisma migrate resolve --applied 202609110001_legacy_baseline
DATABASE_URL="$DOTNEET_DB_URL" npm run db:deploy
DATABASE_URL="$DOTNEET_DB_URL" npx prisma migrate status
```

If the database already contains some new tables, has drift or a different history, prepare a reviewed migration reconciliation. Do not rerun CREATE TABLE blindly, reset the database, or mark the additive migration applied unless its entire schema has independently been proven present. `db:push` and `prisma:migrate` are development tools, not shortcuts around production migration history.

## Tests and isolated integration environment

Run normal source checks from the project root:

```bash
npm run typecheck
npm run lint
npm test
```

The HTTP integration test starts a child Next.js dev server at **127.0.0.1:3100**, a simulated JSON-RPC server at **127.0.0.1:18546**, and uses `.next-integration`. It generates synthetic wallets/signatures and test receipts; it sends no real payments. Both ports must be free. It expects an already migrated **dedicated loopback database** and cleans up its own fixture profiles/receipts/sessions/challenges. Rate-limit buckets may remain until expiry cleanup.

The integration suite requires **DOTNEET_TEST_DATABASE_URL explicitly**, allows only localhost/127.0.0.1, and requires the database name **dotneet_test**. There is no fallback to your ordinary application database. Create this dedicated database once on the local Compose server:

```bash
docker compose exec db createdb -U dotneet dotneet_test
```

If it already exists, confirm that it is a dedicated disposable test database; do not drop another database to satisfy this step. Set the test URL using the actual local password, then migrate and test:

```bash
export DOTNEET_TEST_DATABASE_URL='postgresql://dotneet:replace-with-local-password@127.0.0.1:54329/dotneet_test?schema=public'
DATABASE_URL="$DOTNEET_TEST_DATABASE_URL" npm run db:deploy
NODE_ENV=development NIMIQ_MIN_CONFIRMATIONS=10 npm run test:integration
```

Replace the placeholder password before running. A native PostgreSQL server can use another loopback port, such as54330, but must still provide a dedicated database named dotneet_test. Root's final verification environment uses isolated native PostgreSQL18.4 on port54330; that is separate from the supplied Compose default54329.

The test overrides child APP_ORIGIN/network/RPC with its fixture configuration. Do not run multiple integration suites concurrently on fixed3100/18546 ports. Failed tests may leave fixture state; inspect and clean only the dedicated disposable test database. Use the final validation report for actual PostgreSQL test results; earlier local-adapter checks are not accepted as concurrent-client evidence. Native Nimiq Pay and real RPC checks remain separate.

## Build and production-mode runtime

```bash
npm run build
```

The build script generates Prisma then compiles Next.js. Current public pages load live data through client/API requests; compilation is not a database/RPC health test. Keep a syntactically valid configuration available, but never fill missing RPC with a fake production bypass just to obtain a build pass.

`npm run start` serves the production build. At request time the application treats NODE_ENV production strictly: APP_ORIGIN must be HTTPS. Using the local HTTP example unchanged can let static pages load while authenticated APIs report configuration errors. Use `npm run dev` for the normal local HTTP workflow.

When deployment is separately authorized, provision actual PostgreSQL, configure an HTTPS origin and matching real RPC, rehearse migrations/backups, then run the production service behind the intended HTTPS reverse proxy/hosting layer. A typical internal Node listener is:

```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

The operator must supply the actual external HTTPS APP_ORIGIN and runtime secrets. This command alone does not configure DNS, TLS, process supervision, backups or deployment. Do not publish, push, submit or send real payments as an implicit step in this documentation workflow.

## Backup and restore rehearsal

For real PostgreSQL, the operator supplies `DOTNEET_DB_PG_URL` and a separate empty `DOTNEET_RESTORE_PG_URL` securely. Use libpq-compatible URLs without Prisma-only parameters such as `schema=public`; do not copy a Prisma URL unchanged into these variables. Backups contain private profile/receipt/session data and should stay outside public deliverables with restricted access.

```bash
mkdir -p work/backups
pg_dump --dbname="$DOTNEET_DB_PG_URL" --format=custom --no-owner --file=work/backups/dotneet-before-migration.dump
pg_restore --list work/backups/dotneet-before-migration.dump
pg_restore --dbname="$DOTNEET_RESTORE_PG_URL" --no-owner --exit-on-error work/backups/dotneet-before-migration.dump
```

Restore only into the selected empty rehearsal database, then verify schema and representative counts/constraints. A readable dump listing is not a restore test. Backups and restores were not executed by this documentation pass.

The Compose named volume is persistence, not a backup. Use pg_dump/restore rehearsal for PostgreSQL. Do not treat a hot filesystem copy of the database volume as a transaction-consistent backup.

## Rollback and incident response

- Stop further writes or put the service behind an appropriate maintenance response when a critical integrity/privacy defect is found.
- Roll back application code only to a known safe version compatible with the additive schema. Do not restore the original unauthenticated legacy endpoints as a fallback.
- Retain new tables and signed/payment records during an application rollback. Do not delete recorded receipts to make a migration appear successful.
- Restore a database backup only through an explicit, reviewed recovery action after assessing data written since that backup. It is not an automatic part of deploy failure handling.
- Revoke affected server sessions if needed. Browser cookies are separate: logout clears them; otherwise their configured expiry applies. Removing server session rows makes cookies ineffective even before the browser deletes them.
- If RPC is unavailable, retain drafts and attached hashes. User guidance is “check/reconcile the existing payment,” never “send it again.”

## Expired-data cleanup

The application enforces expiry when using challenges/sessions; cleanup improves retention and database size. It is not necessary to weaken auth when cleanup is delayed. The following SQL is a proposed operator-maintenance action, not an installed job or an action already executed:

```sql
BEGIN;
DELETE FROM "AuthChallenge"
WHERE "expiresAt" < CURRENT_TIMESTAMP - INTERVAL '1 day';
DELETE FROM "WalletSession"
WHERE "expiresAt" < CURRENT_TIMESTAMP;
DELETE FROM "RateLimitBucket"
WHERE "resetAt" < CURRENT_TIMESTAMP - INTERVAL '1 hour';
COMMIT;
```

This removes only expired temporary records, leaving an additional day for challenge troubleshooting and an hour for expired rate buckets. Agree on the retention policy before scheduling it. It does not physically purge browser cookies. Do not delete contribution receipts, signed acknowledgment material or profiles under an “expired data” rule.

To revoke a specific affected wallet's sessions, use a reviewed network/address-scoped deletion and have the user sign in again. An all-session purge signs everyone out and must be a deliberate incident action, not routine cleanup.

## Troubleshooting

| Symptom | Check / safe next step |
|---|---|
| CLI syntax errors before app starts | Confirm active Node >=22.13, then reinstall Linux dependencies from lockfile |
| Cannot connect to local database | Start db:local, check docker compose ps/logs, matching password and54329/DATABASE_URL |
| Migration says table already exists | Stop; inspect history/schema and follow baseline-match procedure |
| Origin rejected | Match browser origin exactly; localhost and127.0.0.1/LAN are different |
| Production API configuration error on local HTTP | Use dev for HTTP or provide intended HTTPS origin/runtime proxy |
| “Open in Nimiq Pay” | Public browser lacks native provider; sample remains available |
| Payment pending/202 | Existing transfer may be indexing or below threshold; check again, do not resend |
| RPC unavailable/wrong network | Check explicit RPC configuration and history support; preserve hash |
| Signature rejected | Check wallet matches issuer and exact current message; regenerate expired challenge without repaying |
| Integration ports busy | Stop only the intended local test process; do not run parallel fixed-port suites |
| Clipboarding unavailable on LAN | Use displayed manual URL fallback or HTTPS |

Use safe application logs and `/api/health` for data connectivity. Never paste secrets, session cookies, private keys or unredacted private contribution text into issue reports. Preserve exact error code, network and action so the next agent can diagnose the correct stage.
