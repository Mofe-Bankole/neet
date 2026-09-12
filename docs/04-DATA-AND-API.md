# Dotneet — Data Model and API Contract

**Revision:** 1.1 · **Source reconciliation:** 11 September 2026. This contract follows the current backend and identified final fixes; it does not claim deployed or real-device validation. Exact source: `prisma/schema.prisma`, `src/lib/domain.ts`, `src/lib/server/*`, and `src/app/api/*`.

## Persistence and migration

Keep Prisma 5 and PostgreSQL. Add the five new models below and leave legacy User, Identity, Profile, Post, Endorsement and ReputationEvent tables isolated. New APIs never read legacy points as credibility or convert old submitted hashes into verified payments. Legacy endpoint methods return `410 LEGACY_ENDPOINT_RETIRED`; secure claim and PATCH profile replace their former behavior.

Back up an existing target database, review an additive migration, rehearse it on a restored/staging copy and use deployment migrations when deployment is authorized. The supported local path is actual PostgreSQL18.4 through Docker Compose on loopback54329, or native PostgreSQL. Integration tests require an explicit loopback URL for the dedicated dotneet_test database. `prisma db push` against disposable local data is not a production migration plan. Never delete legacy production records as a routine step.

## Actual new models

### WalletProfile

| Field | Actual type / meaning |
|---|---|
| `id` | String CUID primary key |
| `network`, `address`, `handle` | Strings; unique `(network,address)` and `(network,handle)` |
| `displayName`, `bio` | Nullable strings; application limits 60 and 280 characters |
| `verifiedAt` | DateTime, set when new wallet-bound profile is created; not refreshed on every later sign-in |
| `createdAt`, `updatedAt` | Server registration/update timestamps |
| `sent`, `received` | ContributionReceipt issuer/recipient relations |

Handle is 3–32 lowercase ASCII letters/digits with interior hyphens allowed. No leading/trailing hyphen or underscore. `.neet` is a display suffix removed during lookup normalization. Claim authority comes from session wallet/network; renames and transfers are excluded.

### AuthChallenge

Fields: `id`, `network`, `address`, `message`, `bindingHash`, `expiresAt`, nullable `usedAt`, `createdAt`. Expiry is indexed. The random nonce, origin and expiry are inside the exact stored canonical message, not separate nonce/origin columns. `bindingHash` binds the challenge to the HttpOnly browser cookie that requested it. Consume `usedAt` atomically once while unexpired.

### WalletSession

Fields: `id`, unique `tokenHash`, `address`, `network`, `expiresAt`, `createdAt`. Expiry indexed. A session can precede profile claim; it is not a mandatory profile foreign key. Session token is random 32-byte hex, hash stored server-side, raw value cookie-only. Challenge lifetime is 300 seconds; session lifetime 86,400 seconds.

### ContributionReceipt

| Group | Actual fields |
|---|---|
| Identity | `id`, `network`, `issuerId`, `recipientId`, issuer/recipient relations; snapshot `issuerAddress`, `recipientAddress` |
| Contribution | `amountLuna` BigInt, `statement`, nullable `evidenceUrl`; no separate title |
| Idempotency | `idempotencyKey`, unique with issuer ID |
| Wallet attempt | `paymentState` default `DRAFT`, nullable `paymentAttemptAt`, nullable random `paymentAttemptId` |
| Transaction observation | Nullable `transactionHash`, `paymentVerifiedAt`, `paymentBlock` Int, `confirmationCount` Int, `verificationPolicy` |
| Acknowledgment | Nullable `acknowledgmentMessage`, `acknowledgmentExpiresAt`, `acknowledgmentPublicKey`, `acknowledgmentSignature`, `signatureVerifiedAt` |
| Publication/lifecycle | Nullable `publishedAt`, `withdrawnAt`; `createdAt`, `updatedAt` |

Unique constraints: `(network,transactionHash)` and `(issuerId,idempotencyKey)`. Indexes: `(recipientId,publishedAt)` and `(issuerId,createdAt)`. Transaction hash is fixed during normal attachment; the only replacement path is independent validation of a recovery candidate for an unsigned unfinished receipt, with a conditional update matching the previous state/hash. Signed records cannot replace payment references.

Payment states stored today: `DRAFT`, `AWAITING_WALLET`, `SUBMITTED`, `CONFIRMED`, `CANCELLED`. Pending, inclusion below the minimum, mismatch, failed execution and RPC outage are request outcomes rather than additional persisted enum values. Signature status derives from `signatureVerifiedAt`, visibility from `publishedAt`, withdrawal from `withdrawnAt`. Do not document nonexistent state columns.

Amount source of truth is integer Luna. `amountNim` input is a decimal string with at most five decimals; supported maximum is 100,000,000,000,000 Luna. JSON serializes `amountLuna` as a decimal string. Profile relations in serialized receipts contain only handle/address. `idempotencyKey` is omitted; public responses must also omit `paymentAttemptId`, including through alternate public-readable routes.

### RateLimitBucket

Fields: hashed `key` primary key, `count`, `resetAt`. Reset time indexed. Raw SQL atomically inserts/increments or resets expired counters, so controls operate across server instances sharing the database. These are per-action global/address/record limits, not an IP analytics system. Expired row cleanup is an operations task.

## HTTP rules

JSON request bodies are objects limited to 12,000 bytes. Protected mutations require exact `Origin: APP_ORIGIN` and a valid session cookie; challenge/verify also require the initiating browser cookie binding. Responses use `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Public v1 GET/OPTIONS allow noncredentialed CORS `*`; private writes are same-origin.

Errors use `{ "error": { "code": "...", "message": "..." } }`. Notable codes include `UNAUTHENTICATED` 401, `ORIGIN_REJECTED` 403, `NOT_FOUND` 404, `CONFLICT` 409, `RATE_LIMITED` 429, `RPC_UNAVAILABLE` 503. Pending verification deliberately returns **HTTP 202 with an error-shaped `PAYMENT_PENDING` body**; clients must inspect payloads, not treat every `response.ok` as verified success.

## Route inventory

| Method | Path | Payload / result |
|---|---|---|
| POST | `/api/auth/challenge` | `{address}` → `{id,message,expiresAt,network}` plus challenge cookie |
| POST | `/api/auth/verify` | `{id,publicKey,signature}` → `{address,network}` plus session cookie |
| GET | `/api/auth/session` | `{session,profile,network,configured}`; session null when signed out |
| POST | `/api/auth/logout` | No JSON required → `{ok:true}`; revoke session |
| POST | `/api/identity/claim` | `{handle,displayName?}` → `{profile}`; 201 new/200 same-wallet same-name retry |
| PATCH | `/api/profile` | `{displayName?,bio?}` → `{profile}`; owner derived from session |
| GET | `/api/receipts?limit=20&cursor=...` | Participant records → `{receipts,nextCursor}` |
| POST | `/api/receipts` | Draft shape below → `{receipt}`; 201 new/200 matching idempotent retry |
| GET | `/api/receipts/[id]` | Participant or public eligible record → `{receipt}`; projection must omit attempt token for public readers |
| POST | `/api/receipts/[id]/payment` | `begin`, `rejected`, attachment or `reconcile`; detailed below |
| POST | `/api/receipts/[id]/verify` | Issuer only; read-only chain check → `{receipt}` or safe verification outcome |
| POST | `/api/receipts/[id]/acknowledgment` | `{action:"challenge"}` or `{publicKey,signature}`; no challenge-generation GET |
| PATCH | `/api/receipts/[id]/publish` | `{published:true,consent:true}` or `{published:false}`; recipient only |
| POST | `/api/receipts/[id]/cancel` | Issuer cancels unpaid DRAFT only |
| POST | `/api/receipts/[id]/withdraw` | Issuer marks previously signed acknowledgment withdrawn |
| GET | `/api/v1/profiles/[handle]` | `{profile,receipts,summary}`; at most 50 public records |
| GET | `/api/v1/receipts/[id]` | `{receipt}`; public eligible record only |
| GET | `/api/v1/handles/[handle]` | `{handle,network,available}` for normalized name on configured network |
| GET | `/api/health` | Database `SELECT 1` check → `{status:"ok"}`; not an RPC/device readiness check |

Public v1 routes support OPTIONS for read integration. Retired APIs include posts, endorsements, reputation, activity, old identity reads and search. Unsupported HTTP methods may receive framework 405 rather than the explicitly retired method's 410.

## Exact draft shape

```json
{
  "recipientHandle": "ada.neet",
  "amountNim": "2.5",
  "statement": "Tested the mobile payment flow and documented a reproducible cancellation issue.",
  "evidenceUrl": "https://example.com/issues/example",
  "idempotencyKey": "example-draft-request-0001"
}
```

This is fictional example data. Recipient must already have a profile on the configured network. The issuer must have a profile, and cannot choose their own profile. Statement: 10–600 trimmed characters. Evidence: optional HTTPS URL, input maximum 1,000 characters, no embedded credentials; no server-side preview fetch. Idempotency key: 16–80 alphanumeric/hyphen characters. Reusing it with different details returns conflict. Unknown owner/wallet fields do not grant authority.

## Payment protocol and safe recovery

1. POST `{ "action": "begin" }` to the payment route. Server conditionally moves DRAFT to AWAITING_WALLET and creates `paymentAttemptId`; receive it from the private receipt response.
2. Request native `sendBasicTransactionWithData({recipient,value,data})`, with exact stored recipient/amount and `data = "dotneet:" + receipt.id`. Only the opaque receipt reference goes on-chain, not the contribution text/evidence URL.
3. On explicit native rejection, POST `{ "action": "rejected", "paymentAttemptId": "<current token>" }`. A timeout is not an explicit rejection.
4. On returned hash, POST `{ "action": "attach", "transactionHash": "<64 hex>", "paymentAttemptId": "<current token>" }`. Normal attachment cannot overwrite an existing different hash. The adapter also accepts `walletResult` instead of transactionHash: a 64-hex hash or a hex serialized Nimiq transaction. It bounds/round-trips serialized data and derives the hash; this is parsing only, not payment confirmation.
5. POST verify. Server checks configured RPC network, transaction hash, parties, integer amount, opaque receipt marker, basic account types, flags, successful execution, positive inclusion height and configured confirmation threshold.
6. If the result is unknown or an incorrect hash was stored, the issuer can POST `{ "action": "reconcile", "transactionHash": "<candidate 64 hex>" }`. This is allowed only for unsigned AWAITING_WALLET/SUBMITTED records. The candidate must pass independent full verification before a conditional replacement/confirmation. An invalid candidate leaves the record unchanged.

A stale attempt token cannot reject or attach to a later attempt. The database unique network+hash constraint applies to recovery as well. All verification/reconciliation calls are read-only with respect to blockchain spending; no backend request initiates a payment.

**Verification policy:** network defaults to testnet; IDs are mainnet 24 and testnet 5. RPC `getNetworkId` must match MainAlbatross/TestAlbatross. `NIMIQ_MIN_CONFIRMATIONS` defaults to 10. Successful checks store `verificationPolicy = "nimiq-pos-inclusion-v1-min-<N>"`, the observed block, count and check timestamp. This is an inclusion-confirmation policy based on the configured RPC, not a macro-block finality proof or a live guarantee after that timestamp.

RPC uses a 12-second timeout and no default verification endpoint. Production RPC must use HTTPS; nonproduction may use HTTP only for localhost/127.0.0.1. Missing/wrong-network/unreadable RPC fails closed. Actual RPC and physical-device compatibility remain separate validation gates.

## Acknowledgment signing

POST `{ "action": "challenge" }` after CONFIRMED. Server returns `{message,expiresAt}`; an already signed record returns its receipt/message with `complete:true`. New challenges last five minutes and reuse an existing unexpired challenge; regeneration is conditional so it cannot overwrite a concurrently signed record.

The exact ASCII-escaped message wraps:

- `receipt`: schema `dotneet.contribution.v1`, purpose `acknowledge-contribution`, origin, receiptId, network, issuer, recipient, amountLuna string, statement, evidenceUrl, transactionHash and createdAt.
- `nonce`: server-generated random value.
- `expiresAt`: ISO timestamp.

The client signs the exact string and submits publicKey/signature hex. The server checks supported Nimiq message framing and public-key-derived issuer. A conditional update must match the stored challenge and unexpired state. A signed acknowledgment remains valid historical evidence after challenge expiry; expiry limits the time allowed to submit the proof, not its subsequent display lifetime.

## Publication and withdrawal

Only the recipient can publish, with `{published:true,consent:true}` after both checks and while active. Signed facts remain unchanged. `{published:false}` removes future hosted public access. Only issuer can withdraw their signed acknowledgment; withdrawal sets `withdrawnAt`. A previously published withdrawn receipt remains inspectable as historical evidence, labeled withdrawn, until recipient unpublishes. It must be excluded from active acknowledgment counts and cannot be newly published after withdrawal. Neither action erases copied signatures/blockchain data or returns money.

## Public reads and list behavior

Public profile response returns the new WalletProfile, up to 50 published confirmed signed receipts ordered by createdAt descending then ID descending, and:

```json
{
  "displayedPublicReceipts": 0,
  "activeDisplayedReceipts": 0,
  "distinctDisplayedIssuerWallets": 0,
  "limit": 50
}
```

These are counts within displayed records, not all-time totals or unique human users. Withdrawn public history remains in displayedPublicReceipts; active counts exclude it. No public profile cursor is currently implemented.

Authenticated `/api/receipts` returns both sent and received records with ID-descending cursor order, default 20/max 50, and `nextCursor`. It re-applies participant/network filters. The implementation defaults missing/zero/non-numeric limits to 20, floors fractional numeric values and clamps the result to 1–50. Verify this normalization and invalid/missing cursor behavior in integration tests.

Public receipts omit idempotency keys and attempt tokens. CORS exposes only public v1 reads without session credentials. Final source adds public-read and receipt-read limits of600/minute and recipient publication20/minute per wallet; verify those call sites and results in the final PostgreSQL validation record.

## Thin consumer example

```ts
export async function readPublicReceipt(baseUrl: string, receiptId: string) {
  const url = new URL(`/api/v1/receipts/${encodeURIComponent(receiptId)}`, baseUrl);
  const response = await fetch(url, { credentials: 'omit' });
  if (response.status === 404) return null;
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error('Dotneet receipt is unavailable.');
  return payload.receipt;
}
```

This is an integration example, not an observed external partnership. Consumers render statements as text, preserve network and withdrawal labels, inspect verificationPolicy/checked timestamps and refresh visibility. A published record may become private later.

## Final implementation amendments

Legacy name reservations are read from the isolated Identity/User tables. Existing verified WalletProfile names take precedence. A legacy handle is reserved until a challenge-verified session matches its original wallet address; invalid legacy addresses require manual migration review. Reclaiming a name creates a new WalletProfile and does not import endorsements, scores, payment assertions or contribution receipts. The availability endpoint adds `reservedForLegacyOwner: boolean`; it does not reserve names merely by checking them.

Before the `begin` payment action changes the draft or opens the wallet, the server checks that its RPC endpoint is configured, available and on the selected network. Failure leaves DRAFT unchanged. The client also checks the current wallet address before beginning payment and before requesting an acknowledgment signature. Native wallet switching during an approval remains a device-validation case.

`action: "attach"` accepts either `transactionHash` or `walletResult`, plus the exact `paymentAttemptId`. A wallet result may be a strict 64-hex hash or a bounded, exactly round-trippable serialized Core transaction. Parsing derives a hash only; it never broadcasts or confirms a payment. Only independent RPC verification can confirm it.

The final implementation and test evidence are listed in [VALIDATION.md](VALIDATION.md). All public API errors include the public CORS headers. Successful public projections omit idempotency keys and wallet attempt tokens.
