# Dotneet — Baseline Assessment

**Scope:** Read-only source inspection on 10 September 2026. Findings describe the inspected commit, not proof that the same code is deployed or that an attack was attempted.

## Verified baseline

- Repository: `https://github.com/Mofe-Bankole/neet/`.
- Default checked-out branch: `master`.
- Commit: `6677889fcbb782eef22223d8172bbc7584dda3ea`.
- Commit subject: `feat: Nimiq SDK integration with @nimiq/mini-app-sdk`.
- Remote feature branch inspected: `origin/feat/sdk-reputation-client`; its SDK source was reviewed read-only during reconciliation on 11 September. This is not evidence of publication or external integration.
- Manifest: Next.js 16.3.4; React/React DOM 19.2.8; Prisma 5.22; Mini App SDK `^0.1.0`; HeroUI `^3.2.4`; Tailwind 4; TypeScript 5.
- Database schema: PostgreSQL and Prisma; User, Identity, Profile, Post, Endorsement and ReputationEvent tables.
- Existing pages: landing, `/app`, dynamic `/<handle>` profile.
- Existing services: Prisma singleton, Nimiq client wrapper and wallet/identity hooks.

## Important findings and response

| Source finding | Product/security implication | Required response |
|---|---|---|
| Claim route accepts a supplied wallet address without a verified ownership proof | Anyone able to call the route could submit an address they do not control | Replace with signed challenge/session ownership and new WalletProfile |
| Profile PUT identifies the record by submitted identity ID without session ownership | Record identifiers are treated as authority | Replace with owner-derived PATCH; reject untrusted owner fields |
| Endorsement POST accepts transaction hash/amount and awards points without independent chain verification | A hash string is presented as evidence it does not establish | Retire legacy endpoint and score semantics; add independent receipt verification |
| ReputationEvent awards points for claim/profile/payment-related actions | Number can be mistaken for general credibility; incentives do not establish work quality | Omit global score; show factual signed and payment records |
| `signMessage` returns signature but discards public key | Server cannot directly establish expected signer from that wrapper | Preserve complete provider signature result |
| `getNimiqAccount` and wallet hook hardcode testnet | UI can misstate active network | Use explicit application configuration and matching verification; validate wallet environment on device |
| Provider availability is tested via immediate `window.nimiq` presence | Delayed injection can strand valid Mini App users | Initialize SDK asynchronously with bounded timeout and retry |
| Hook cleanup passes fresh callback functions to `off` | Listeners may not be removed correctly | Retain/remove matching callback references if subscriptions remain supported |
| Schema stores old amount as Float; duplicate endorsement guard is query-only | Exact amounts and concurrency guarantees are weak | Integer Luna and database uniqueness in new receipt model |
| README contains roadmap completion checkboxes and stack assertions not established by inspected handlers | Documentation can overstate completion or be stale | Replace with observed implementation status and validation evidence |

Relevant source paths: `src/app/api/identity/claim/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/endorsements/route.ts`, `src/lib/nimiq.ts`, `src/hooks/useNimiqWallet.ts`, `prisma/schema.prisma`, `README.md`.

## What to preserve

Preserve the repository's Next.js App Router structure, TypeScript setup, Node route-handler approach, PostgreSQL/Prisma investment, appropriate Mini App SDK calls, and useful existing UI/component structure. Retain `.neet` identity as a memorable interface for the new experience. Keep the user's baseline history available rather than erase it.

The old README describes white/gold styling, Poppins typography and profile cards. Treat these as existing visual inputs to assess; confirm actual CSS/component behavior and licensed assets rather than assume every README statement is accurate.

## Existing SDK branch — reuse decision

The remote branch contains `packages/sdk` with an ESM TypeScript `@neet/sdk` 0.1.0 package, an HTTP client with timeout/cancellation and custom fetch support, typed identity/search/reputation/activity wrappers, error types, and handle/address validators. Its package advertises MIT and build/typecheck scripts; no package publication or tests were executed by this assessment.

Do **not** merge the branch wholesale into the receipt product. Its endpoint wrappers call retired `/api/identity`, `/api/reputation`, `/api/activity` and `/api/search` routes; its types include scores and legacy endorsements; handle validation permits underscores and max20 rather than new max32/interior-hyphen rules. The client defaults to mainnet and sends an `x-neet-network` header, while the new server derives network from configuration and its current public CORS does not allow arbitrary request headers. Error parsing expects a string `error` rather than the new `{code,message}` object.

Reusable ideas are the small read-client structure, timeout/cancellation cleanup and injectable fetch. If an SDK is needed, adapt those pieces explicitly to `/api/v1/profiles`, `/api/v1/receipts` and `/api/v1/handles`, remove unsupported custom network headers, use current types/errors and keep it read-only. A thin documented helper is sufficient for the sprint. The branch also changes old wallet integration files; importing its entire diff would risk reverting current SDK work.

## What remains unverified by this assessment

- Which commit the existing Vercel site currently deploys.
- Contents/state of the live database, credentials, users or transactions.
- Native Nimiq Pay behavior of the current site on physical devices.
- Real user demand, measured adoption, signed contribution evidence or partner integration.
- Whether an adapted SDK builds/passes integration tests or has an actual external consumer; the old wrapper cannot be used unchanged.
- Whether external production infrastructure is configured for the replacement implementation.

No source finding authorizes destructive production migration. New work should use an isolated checkout and disposable local data until deployment is explicitly requested.

## Source references checked for this package

- [Mini App overview](https://nimiq.dev/mini-apps): architecture/provider behavior.
- [Provider API](https://nimiq.dev/mini-apps/api-reference/nimiq-provider): account, signing and payment method contracts.
- [Local Mini App guide](https://nimiq.dev/mini-apps/development/load-local-mini-app): device/LAN setup and testnet guidance. Its generic Vite command must be adapted to Next.js.
- [RPC migration guide](https://nimiq.dev/migration/migration-json-rpc): transaction lookup and micro/macro block distinctions.
- [Competition scoring](https://miniappscompetition.com/scoring) and [rules](https://miniappscompetition.com/rules): submission priorities and expectations.

Current official signing examples require implementation-level cross-checking; see the architecture compatibility gate. Do not copy public examples into authentication code without proving the exact message framing against the installed/native signer.
