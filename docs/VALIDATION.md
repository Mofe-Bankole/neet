# Delivery status and validation evidence

**Recorded:** 11 September 2026. This report describes the delivered source snapshot, not the current public Dotneet site. The source manifest identifies the baseline and local handoff commit. No changes were pushed upstream and no public deployment occurred.

## What is delivered

The initial MVP implementation, product/engineering documentation, reusable design foundations, representative visual assets and agent handoffs are included. The implemented local flow covers wallet ownership challenges, session-bound names, contribution drafts, payment authorization/recovery contracts, independent payment checks, separately signed acknowledgments, recipient-controlled publication and permitted public reads.

The local automated checks passed. **The complete journey has not been exercised inside Nimiq Pay or against a real blockchain transaction.** Treat this as an implementation ready for device integration validation and design refinement, not as a production-ready payment service.

| Route | Delivered behavior | Evidence and boundary |
|---|---|---|
| `/` | Responsive landing page using shared tokens and components | Desktop/mobile browser inspection; receipt is explicitly fictional |
| `/preview` | Interactive sample profile, payment review and receipt states | Browser interactions inspected; no wallet calls, real receipts or transfers |
| `/design-system` | Live foundations, component specimens and cross-format references | Browser inspection, labels/focus checks and linked SVG examples |
| `/app` | Wallet sign-in, claim, returning profile, editing and sent/received records | Real backend HTTP contracts tested; ordinary-browser provider-unavailable state inspected; authenticated native UI untested |
| `/acknowledge?to=<handle>` | Contribution draft form and transition to receipt review | Implemented against tested draft API; native end-to-end journey pending |
| `/<handle>` | Public profile and permitted receipt history with real empty/error states | Public backend projection tested; sample profile separately demonstrated in `/preview` |
| `/receipts/<id>` | Participant/public inspection, payment approval and recovery, signing, publication, withdrawal and sharing | Lifecycle HTTP contracts tested; native authorization, device clipboard and interrupted WebView behavior pending |
| `/api` and `/api/v1/*` | Public API reference and profile/receipt/availability reads | HTTP visibility, contract and CORS checks; thin consumer example supplied; no third-party adoption claimed |

Existing reputation/endorsement/post endpoints were retired with HTTP 410 responses. Historical root PRD/FRD/SDK-assignment documents are marked superseded; the current requirements are in `docs/01-PRD.md` and `docs/02-FRD.md`.

## Checks actually performed

Verification ran on **macOS with Node.js 24.19.0, npm 11 and native PostgreSQL 18.4**. The Linux setup and Compose configuration are supplied for the receiving environment; Linux/Docker execution was not performed here. Dependencies were installed using the included lockfile.

| Check | Result | What it establishes |
|---|---|---|
| Prisma generation/schema preparation | Passed | Prisma client generated for the delivered schema |
| Fresh database migrations | Both migrations applied to an isolated native PostgreSQL database | Baseline and additive SQL execute against an empty database; does not validate migration of existing production data |
| Unit tests: `npm test` | **41 passed, 0 failed** | Domain validation, independent Ed25519 fixtures, exact message encoding, wallet result parsing and strict RPC fixtures |
| HTTP/database integration: `npm run test:integration` | **13 lifecycle scenarios passed**; Node reports 14 tests including the parent suite | Real Next.js handlers and PostgreSQL constraints exercised with synthetic wallets and a local simulated RPC |
| ESLint: `npm run lint` | Passed | No reported lint errors in the delivered source |
| TypeScript: `npm run typecheck` | Passed | Static type check; also checked by the final production build |
| Production build | Passed using `DOTNEET_BUILD_DIR=.next-build npm run build` | Next.js compilation, TypeScript and route generation succeeded; not a production deployment or runtime/network health check |
| Design token synchronization | 41 CSS variables matched JSON; source SHA-256 matched | Machine-readable foundations reflect the implemented CSS |
| Asset export | 10 layout SVGs and one wordmark exported and parsed | Editable source assets have valid XML and resolved shared token values; not native PowerPoint masters |
| Browser review | Representative pages and sample states inspected | Narrow layout, visible status/error behavior and limited keyboard checks described below |

The integration harness requires an explicitly supplied loopback database named `dotneet_test`. Its application and simulated RPC use ports 3100 and 18546. Keys are generated in memory for local fixtures; no actual wallet credentials or private keys are included in the package. No real NIM transfer was sent.

An earlier socket-emulated database experiment failed concurrent-client correctness and was discarded. It is not included in the supported setup or counted as passing evidence. Final lifecycle results used native PostgreSQL, including independent concurrent client connections.

## Tested lifecycle and requirement traceability

The full test catalogue in [07-TEST-AND-ACCEPTANCE.md](07-TEST-AND-ACCEPTANCE.md) includes additional release cases. It must not be read as a list of completed checks. The mapping below identifies actual evidence and the remaining boundaries.

| Requirements / implementation task | Source and automated evidence | Remaining check |
|---|---|---|
| AUTH-01–05 / T02 | `src/lib/server/auth.ts`, `crypto.ts`, `src/hooks/useSession.ts`; crypto unit tests and integration scenarios for origin/body validation, wrong signer, valid control, cookie binding, replay and expiry | Native SDK return compatibility, account switch, WebView cookie persistence, interrupted challenge and delayed provider behavior |
| ID-01–03, PROFILE-01–03 / T03 | `src/lib/domain.ts`, `src/lib/server/profiles.ts`; unit normalization plus HTTP claim, returning session, owner editing and legacy-name reservation/reclaim | Native returning-user experience and any intended production legacy data |
| ACK-01, PAY-05–06 / T04 | `src/lib/server/receipts.ts`; exact amounts, private drafts, unauthorized reads, concurrent identical idempotency requests and cancellation | Device reload/navigation through unfinished drafts |
| PAY-01–06 / T05 | `src/lib/server/rpc.ts`, `receipts.ts`, `src/lib/nimiq.ts`; fixtures reject changed network/parties/amount/reference/types/flags/hash/execution; pending/outage parsing; begin preflight, concurrent begin, stale rejection, duplicate transaction reference and strict reconciliation | Actual indexed RPC payloads, confirmation progression, real wallet return shapes, native rejection classification and ambiguous send recovery |
| ACK-02–04, RECEIPT-01/04 / T06 | Canonical message and crypto units; concurrent challenge generation, wrong signature, expiry and valid exact-message integration cases | Native acknowledgment display/signature and cancellation after an actual payment |
| RECEIPT-02–06, PROFILE-01 / T07 | Consent, participant authorization, public projection, withdrawal history, active-count exclusion, unpublish and immutable payment tests | Clipboard fallback inside Pay, recipient usability and real publication/reload sequence |
| API-01–03 / T01/T08 | Public route handlers, no-store/CORS headers, capped public projection, self-list pagination and disabled legacy route source | External consumer against an authorized live environment, read-rate limits under load and broader abuse tests |
| UX-01–03 / T09 | Shared components and tokens, page source, browser checks and included screenshots | Full keyboard/screen-reader audit, authenticated error-state layout and target-device testing |

These examples do not establish every possible race interleaving, browser condition or attack resistance. In particular, source review of conditional database updates is broader than the concurrency cases actually executed.

## Browser and visual evidence

Seven JPEG viewport captures are included in [screenshots/README.md](../screenshots/README.md), with route/state, dimensions and data labels. They show the landing page at 1440×1000 and 390×844, sample profile at 1440×1000, payment/pending receipt at 1280×900, provider-unavailable entry at 390×844, and design reference at 1440×1000.

The landing page was also checked at 320px and 390px: document width matched viewport width after a decorative receipt overflow was corrected. The workspace fit 320px. The design reference fit 390px, had one h1 and no unlabeled specimen fields in the inspected state. Keyboard Tab moved from the name field to its description field with a visible 3px outline. Sample profile/payment/receipt navigation and pending/unavailable messaging were inspected. An ordinary browser produced the intended bounded provider-unavailable state rather than a false wallet connection.

Opaque semantic color pairs were calculated in the design-system document. These limited checks do **not** constitute a complete WCAG audit. Real data with unusually long text, authenticated mobile controls, screen readers and all focus/error transitions need further review. Screenshots contain fictional data or a local error state; none is evidence of a real payment or native wallet authorization.

## Unresolved release requirements

1. **Nimiq Pay devices and indexed testnet RPC.** Run two test wallets through ownership, name claim, payment, separate acknowledgment, private inspection, recipient publication and unpublication. Capture actual SDK values, app/device versions and network. Validate both intentional cancellation and ambiguous failure without resending funds.
2. **Actual payment observations.** Verify the real RPC schema, matching network, transaction reference and confirmation progression. The default ten-confirmation policy is an observed inclusion threshold; this service has no background reorganization monitor and does not claim irreversible finality. Receipts expose verification timestamps.
3. **Existing data and deployment environment.** Rehearse baseline comparison/migration, backup and restore against a copy of the intended database. Test HTTPS, cookies, secrets, process supervision and database/RPC health in the selected hosting setup when deployment is authorized.
4. **Authenticated usability and accessibility.** Inspect the complete mobile journey inside Pay, account changes, expired sessions, pending states and clipboard/manual sharing. Improve the shared design system and pages together through the Claude handoff.
5. **Competition evidence.** Observe a real useful contribution and record a short demonstration only after the relevant checks pass. Proposed recruitment and adoption targets are not measured results. No partnership or prize outcome is claimed.

Dotneet stores names and receipts in a hosted database. It verifies wallet control, a signed statement and a matching payment observation; it does not establish human identity, honesty, contribution quality or resistance to colluding wallets. Unpublishing cannot remove already copied material or on-chain payment data. A payment reference is opaque but can become linkable after a receipt is published.

## Continue without reconstructing context

Use the [OpenCode starting prompt](OPENCODE-START-PROMPT.md) for Linux engineering continuation and the [Claude continuation prompt](CLAUDE-CONTINUATION-PROMPT.md) for design and page refinement. Follow the [operations guide](09-LINUX-OPERATIONS.md) with a fresh local database. The archive excludes credentials, local databases, installed dependencies and running browser/server sessions; supply environment access separately.

The remaining device, real-network and production checks above are the next work. Reuse the completed implementation rather than restarting the eight-day plan. Public deployment remains outside this delivery.
