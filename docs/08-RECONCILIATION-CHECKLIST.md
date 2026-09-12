# Engineering reconciliation — root checklist

**Reviewed:** 11 September 2026. This document records the source review and its final disposition. Actual execution evidence is in VALIDATION.md.

## Source decisions now reflected in all drafts

- New WalletProfile/AuthChallenge/WalletSession/ContributionReceipt/RateLimitBucket models remain separate from legacy tables.
- Profile handle is 3–32 letters/digits/interior hyphens, no underscores; displayName60/bio280; one 10–600-character statement, no separate contribution title; evidence input1000; integer Luna string serialization.
- Challenge browser binding, five-minute lifetime and 24-hour session; cookies use Strict/HttpOnly with HTTPS Secure.
- Payment data marker `dotneet:<receiptId>` is mandatory for independent verification. Default policy is ten observed inclusion confirmations, not deterministic finality.
- Persisted payment states are DRAFT/AWAITING_WALLET/SUBMITTED/CONFIRMED/CANCELLED. Pending/outage/mismatch are transient outcomes; HTTP202 error body is not success.
- Payment uses begin → exact random attempt-token attach/rejected. `action:"attach"` is required; optional walletResult parser supports hash/serialized transaction while still requiring chain verification.
- `action:"reconcile"` independently validates a replacement candidate before CAS; only unsigned unfinished records qualify.
- Acknowledgment challenge generation is POST `action:"challenge"`, never mutating GET; signing uses canonical ASCII JSON plus nonce/expiry and conditional update.
- Publication is recipient-only. Withdrawn previously-public history remains inspectable and labeled, with active counts excluding withdrawal; no new publication after withdrawal.
- Public handle availability responds `{handle,network,available,reservedForLegacyOwner}`. Self-list uses a cursor with default 20/max 50 and floors fractional limits; public profiles cap at 50 with displayed-count names and no public cursor.
- Public reads are no-store/noncredentialed CORS; root fixed alternate generic receipt route to strip attempt tokens for nonparticipants.

## Concrete fixes observed during reconciliation — verify with tests

| Fix | Source | Test evidence still required |
|---|---|---|
| Same-payload idempotent draft race returns existing record | `server/receipts.ts` createReceipt | D02 |
| Payment attempt token prevents late rejection/attachment on a newer attempt | payment handler/model | P02–P04 |
| Independently verified recovery is CAS-bound to prior state/hash/attempt | payment reconcile | P12–P13 |
| Payment verification CAS prevents old-hash observation from updating a changed record | verifyPayment | P13 |
| Acknowledgment generation/signing uses conditional current challenge checks | acknowledgment functions | S02–S04 |
| Public generic receipt GET selects participant/public serialization | `api/receipts/[id]/route.ts` | R02 |
| Publish condition includes complete signed state and no withdrawal | publish | R03, R06 |
| Cancel checks successful conditional update | cancel | R07 |
| Fractional list limit is floored before Prisma | listReceipts | I02 |
| Client helper checks payload.error, including HTTP202 | `src/lib/client.ts` | P09 |

## Final disposition

The source fixes above are included in the delivered implementation. Native PostgreSQL lifecycle tests exercised idempotent draft creation, attempt-bound rejection, reconciliation, concurrent acknowledgment challenge generation, public projection, consent, cancellation, pagination and withdrawal. Unit tests cover signature and transaction validation failures. See VALIDATION.md for exact evidence and untested interleavings; a passing example is not a proof of all possible concurrency behavior.

The lightweight database adapter was removed after failing concurrent-client correctness. The package uses native/Compose PostgreSQL. Actual Nimiq Pay devices, real indexed RPC transactions and production migration/load behavior remain release checks. The final public API also includes legacy-name reservations and an RPC-network preflight before payment begin.

Client privacy rendering is participant-aware, and wallet address checks run before payment and acknowledgment signing. Native account changes, cookie behavior and interrupted approvals still need device validation. No real payment or public deployment occurred during this work.
