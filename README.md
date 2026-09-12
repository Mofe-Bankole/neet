# Dotneet — Get paid. Keep the proof.

Dotneet gives Nimiq contributors a wallet-bound .neet name and inspectable receipts for paid contributions. Builders authorize a NIM payment, then sign an acknowledgment. Contributors decide whether to publish the resulting record.

This package contains the initial implementation, product and engineering specifications, a reusable design system, representative visual templates, and separate OpenCode and Claude handoffs. It was prepared for a solo developer working within an eight-day competition sprint.

**Delivery status:** local implementation and automated checks are complete. Native Nimiq Pay device tests, real blockchain verification, a production-data migration rehearsal and public deployment have not been performed. No real payment, public submission, outreach or adoption result is claimed. See [validation](docs/VALIDATION.md) before continuing.

## Start here

1. Read [validation and current status](docs/VALIDATION.md), then [product requirements](docs/01-PRD.md).
2. Review [functional requirements](docs/02-FRD.md), [architecture](docs/03-ARCHITECTURE.md) and [data/API contracts](docs/04-DATA-AND-API.md).
3. Follow [Linux setup and operations](docs/09-LINUX-OPERATIONS.md) to reproduce the preview.
4. Review the [design system](docs/10-design-system.md), [cross-format layouts](docs/11-cross-format-templates.md), [page inventory](docs/12-page-specifications.md) and [screenshots](screenshots/README.md).
5. Continue with the [OpenCode starting prompt](docs/OPENCODE-START-PROMPT.md) or the [Claude continuation prompt](docs/CLAUDE-CONTINUATION-PROMPT.md).

The final delivery manifest identifies the upstream baseline and the local handoff snapshot. The original public repository is [Mofe-Bankole/neet](https://github.com/Mofe-Bankole/neet). Changes in this package were not pushed there.

## Complete document index

| Part | Document |
|---|---|
| Assessment | [00 · Existing implementation and reuse decisions](docs/00-BASELINE-ASSESSMENT.md) |
| Product | [01 · PRD](docs/01-PRD.md) |
| Behavior | [02 · FRD and requirement identifiers](docs/02-FRD.md) |
| Engineering | [03 · Architecture, sequence and state diagrams](docs/03-ARCHITECTURE.md) |
| Contracts | [04 · Data model, migration and API specification](docs/04-DATA-AND-API.md) |
| Delivery plan | [05 · Ordered implementation tasks, traceability and eight-day schedule](docs/05-IMPLEMENTATION-AND-TRACEABILITY.md) |
| Protection | [06 · Security and privacy](docs/06-SECURITY-AND-PRIVACY.md) |
| Verification | [07 · Testing and release acceptance](docs/07-TEST-AND-ACCEPTANCE.md) |
| Review findings | [08 · Reconciliation and remaining release checks](docs/08-RECONCILIATION-CHECKLIST.md) |
| Operations | [09 · Linux setup, database, deployment and recovery](docs/09-LINUX-OPERATIONS.md) |
| Design | [10 · Brand, tokens and components](docs/10-design-system.md) |
| Cross-format | [11 · Slides, social graphics, video, reports and asset guidance](docs/11-cross-format-templates.md) |
| Pages | [12 · Page specifications and actual source paths](docs/12-page-specifications.md) |
| Claude handoff | [13 · Design and website refinement brief](docs/13-claude-handoff.md) |
| OpenCode handoff | [14 · Linux engineering continuation](docs/14-opencode-handoff.md) |
| Packaging | [15 · Archive contents and transfer instructions](docs/15-archive-file-manifest.md) |
| Actual results | [Validation and remaining limitations](docs/VALIDATION.md) |
| Research | [Nimiq capability/source verification](docs/NIMIQ-VERIFICATION-RESEARCH.md) |
| Strategy appendix | [Competition positioning research](docs/COMPETITION-STRATEGY.md) |

## Reproduce a local preview

Use Node.js >=22.13, npm and PostgreSQL. The application uses Next.js route handlers on Node.js; no separate backend service is required.

```bash
npm ci
cp .env.example .env
# Set a local database password and matching DATABASE_URL in .env.
npm run db:local
npm run prisma:generate
npm run db:deploy
npm run dev
```

`db:local` starts PostgreSQL through Docker Compose on loopback port54329. A native PostgreSQL installation is also supported; configure DATABASE_URL accordingly. Run deployment migrations against a fresh local database only at this stage. Existing databases need the baseline review in the operations guide.

Open [the landing page](http://localhost:3000/), [interactive sample](http://localhost:3000/preview) and [design reference](http://localhost:3000/design-system). These pages are usable without a wallet. The fictional sample never creates receipts or sends funds. `/app` connects the actual wallet flow inside Nimiq Pay.

Set an indexed Nimiq RPC endpoint and its matching network before any real wallet test. An unavailable or mismatched verifier prevents starting a payment. All configurations default to testnet. Production requires HTTPS for the application origin, cookies and RPC.

## Source and reusable assets

- `src/app/`: page entry points and Node.js API routes.
- `src/components/`: shared controls and connected page components.
- `src/lib/server/`: authentication, authorization, payment checks and receipt lifecycle.
- `src/design/tokens.css` and `tokens.json`: shared semantic foundations.
- `prisma/`: original-schema reference, additive schema and two migration files.
- `tests/`: independent unit fixtures and real-PostgreSQL HTTP lifecycle tests.
- `examples/read-profile.ts`: small cross-origin public integration example.
- `public/assets/`: editable wordmark and ten SVG layout examples, with [usage rules](public/assets/README.md).
- `screenshots/`: representative local captures with their data mode and viewport.

After changing design foundations, run `npm run tokens:export` and `npm run assets:export`. Keep the website, token JSON, gallery, templates and design documentation synchronized.

## Continue from this point

Prioritize actual Nimiq Pay tests on the target devices, with an indexed testnet RPC. Capture the exact native signature/payment return shapes, rejection behavior, reload/recovery and publication flow. Then rehearse migration on a copy of the intended production database. Use the remaining sprint for usability refinement, a short real demo and observed builder feedback.

A signature identifies a signing wallet; a payment check identifies a matching observed transaction. Neither establishes human identity, honesty or work quality. Dotneet is a hosted application using blockchain payments, and its names are application records rather than blockchain-native domain ownership.

Public deployment remains outside this delivery.
