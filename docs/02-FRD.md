# Dotneet — Functional Requirements

**Revision:** 1.1 · **Reconciled:** 11 September 2026. Normative behavior aligned with the current backend and explicitly identified final fixes. Source presence does not establish execution; see the discrepancy and validation documents before claiming completion.

## Roles and common rules

**Visitor:** reads published material. **Authenticated wallet:** has passed a server-issued ownership challenge. **Identity owner:** controls the wallet bound to an identity. **Issuer:** controls the paying/acknowledging wallet. **Recipient:** controls the wallet receiving payment. These are capabilities, not verified human identities.

All writes validate payloads on the server. IDs and wallet addresses in browser state are untrusted. Authorization derives from the server session and immutable stored relationships. Return useful field errors without database internals. Render user text as text, not arbitrary HTML.

## Requirements and acceptance cases

| ID | Requirement | Acceptance evidence |
|---|---|---|
| AUTH-01 | Initialize the Mini App SDK asynchronously with a bounded timeout and a retry. Explain how to open the app in Nimiq Pay when the provider is absent. Do not infer availability only from an early `window.nimiq` check. | Delayed-provider and ordinary-browser cases resolve to useful states |
| AUTH-02 | Issue a cryptographically random server challenge bound to configured application origin, intended wallet and network, issue time, expiry and unique nonce. Suggested expiry: five minutes. | Challenge content and stored expiry are inspectable; browser cannot supply authoritative challenge text |
| AUTH-03 | Verify the exact signed bytes, valid signature and public-key-derived address. Atomically consume the challenge once. Reject expired, reused, unknown, modified, wrong-origin and wrong-wallet proofs. | Positive signature test plus negative and concurrent replay tests |
| AUTH-04 | Establish a revocable server session using an unpredictable cookie token; store only its hash. Use HttpOnly, SameSite and HTTPS Secure controls. Return current identity on session recovery. | Session refresh, logout and expiry tests; token is not in local storage or API public data |
| AUTH-05 | Treat wallet changes/disconnection as a reason to clear stale UI state and reauthenticate. Never silently keep an old signing identity after account change. | Account switch stops pending authorization and prompts a fresh challenge |
| ID-01 | Normalize handles by trimming, lowercasing and removing one trailing `.neet` suffix. Accept 3–32 lowercase ASCII letters/digits with optional interior hyphens; first and last characters must be alphanumeric. Underscores are not accepted. Reject reserved route/product names. | Case/suffix variants resolve to one key; malformed and reserved names rejected |
| ID-02 | Claim a unique handle for the session wallet and configured network in a transaction. One new wallet profile per wallet per network; concurrent claims return a clear conflict. Never accept a body address as authority. | Two concurrent requests cannot claim the same network+handle; unrelated wallet cannot claim on behalf of owner |
| ID-03 | Show the canonical name and registration date from the new wallet-verified profile system. Existing unverified identity records stay isolated; do not migrate them automatically into new profiles or give them a verification label. | Legacy record has no blanket verification badge and is absent from the current public API |
| PROFILE-01 | Public profile displays permitted profile fields and published verified receipts, with a genuine empty state. Distinguish handle registration from wallet-control verification and payment facts. | Public serialization excludes private receipts and private totals |
| PROFILE-02 | Only session owner edits display name/bio/permitted imagery. Enforce lengths and URL safety. Wallet transfer and handle rename are excluded. | Wrong-owner mutation denied; invalid inputs rejected; valid changes persist |
| PROFILE-03 | Returning owner sees their existing profile and incoming/sent records after session recovery; no second claim is required. | Reload and fresh challenge both recover the same identity |
| ACK-01 | Issuer creates a draft for an existing recipient, containing a contribution statement, optional evidence URL, integer amount and configured network. There is no separate title field in this MVP. Block same-wallet self-payment as product policy, without claiming this prevents collusion. | Server validates recipient, fields and amount; draft private by default |
| ACK-02 | After independently verifying payment, generate canonical ASCII-escaped JSON from stored facts inside a five-minute nonce-bound acknowledgment challenge. Bind receipt ID, origin/schema, parties, network, exact amount, evidence URL, statement, transaction hash and creation time. Request challenge through POST with `action: "challenge"`, not a mutating GET. Signed facts cannot change. Before signing, reconciliation may replace a bad hash only after independently validating the candidate against the complete stored receipt. | Altered facts/signature fail; concurrent challenge replacement/sign submission uses conditional updates; post-sign hash replacement denied |
| ACK-03 | Request native acknowledgment approval; retain both public key and signature; verify signer equals issuer and matches the paying wallet. Store exact signed message and format version. | Correct signature passes; other-wallet and altered-message signatures fail |
| ACK-04 | Signing cancellation leaves a recoverable record. If payment already occurred, show “Payment recorded; acknowledgment still needed” and offer signing again, never automatic repayment. | Cancellation/reload after payment can resume signing against the same transaction |
| PAY-01 | Show explicit recipient name/address, configured network, exact NIM amount and fee context before requesting native payment authorization. Use integer Luna; 100,000 Luna = 1 NIM. | Decimal parsing avoids floating-point rounding and rejects more than five decimal places |
| PAY-02 | Call `sendBasicTransactionWithData` with the opaque on-chain reference `dotneet:<receiptId>`. Begin records an attempt before the wallet call. POST `action: "attach"` with transactionHash or walletResult plus the exact attempt token. The SDK response and serialized-result parser prove neither inclusion nor confirmation. | Hash-only submission remains unverified; wrong reference/attempt token rejected |
| PAY-03 | Server retrieves transaction data from the configured network and compares sender, recipient, integer value, network, successful execution where available, and inclusion/confirmation according to documented policy. | Wrong amount/sender/recipient/network and failed transactions cannot become confirmed |
| PAY-04 | Persist `DRAFT`, `AWAITING_WALLET`, `SUBMITTED`, `CONFIRMED` or `CANCELLED`. Pending/included-below-threshold/mismatch/unavailable are transient verification outcomes that must be rendered separately. `CONFIRMED` means a successful matching basic transfer met `NIMIQ_MIN_CONFIRMATIONS` (default 10) at check time; it is not a deterministic-finality claim. | RPC fixtures and device/network check distinguish inclusion, configured confirmation policy and unavailable service |
| PAY-05 | Enforce unique network+transaction hash, issuer-scoped draft idempotency and conditional attempt updates. Begin returns a random `paymentAttemptId`; rejection and attachment must present that exact token. A late result from an old attempt cannot reset or attach to a later attempt. | Concurrent replay, stale-token and duplicate-hash tests; verification retry contains no payment call |
| PAY-06 | Unknown result after a wallet timeout is ambiguous. `action: "reconcile"` may validate a user-supplied transaction hash for an unsigned `AWAITING_WALLET`/`SUBMITTED` receipt. Only a fully matching independently verified candidate can replace the prior hash and confirm the receipt, with compare-and-set protection. Never state “not paid” merely because the client timed out. | Wrong recovery candidate leaves record unchanged; valid candidate resumes signing without another transfer |
| RECEIPT-01 | A completed receipt requires a valid acknowledgment and confirmed matching payment. Before completion, show each state separately. | Either missing proof prevents a completed verification badge |
| RECEIPT-02 | Receipt content is private to issuer/recipient until the authenticated recipient explicitly publishes. Issuer cannot publish for recipient. | Stranger and issuer publication attempts denied; API/profile/metadata do not leak private content |
| RECEIPT-03 | Recipient can unpublish. New public requests stop returning it; explain that copies and blockchain data may remain elsewhere. | Unpublish removes public detail/list results without changing signed facts |
| RECEIPT-04 | Public receipt shows issuer, recipient, exact statement, optional evidence link, amount, network, transaction hash, signature provenance and check timestamps. UI distinguishes factual checks from contribution quality. | Receipt can be inspected without a generic score or unsupported trust claim |
| RECEIPT-05 | Receipt sharing exposes only a published canonical URL. The delivered UI implements clipboard copy with a displayed manual-URL fallback; native Web Share is deferred. Public profiles may also be shared. | Browser and WebView copy/manual fallback tests |
| RECEIPT-06 | Permit explicit cancellation only of an unpaid `DRAFT`. Issuer withdrawal sets `withdrawnAt` without erasing original signed facts or refunding payment. A previously published withdrawn record remains public historical evidence until the recipient unpublishes; prominently label withdrawal and exclude it from active receipt counts. It cannot be newly published after withdrawal. | Permission/state tests; withdrawn record is never presented as a current acknowledgment |
| API-01 | Provide versioned public profile/receipt reads and a handle-availability endpoint. Availability means only that a registry name is free on this network; it is not a person or brand ownership claim. Public data uses the same visibility policy as pages. | API contract and cross-origin read example |
| API-02 | Self receipt list uses ID-descending cursor order, default 20/max 50. Public profiles return at most 50 published records ordered by creation time and ID, with counts explicitly labeled as displayed counts; no public cursor pagination is promised. All JSON is no-store; public v1 reads are noncredentialed CORS. Normalize limits by defaulting missing/zero/non-numeric values to 20, flooring fractions and clamping to 1–50; protect public reads from abuse before production release. | List input, privacy and rate-limit tests; any unimplemented validation/rate limits remain documented release gaps |
| API-03 | Disable legacy endorsement, reputation and post mutation paths; no hidden client path awards points or bypasses new authorization. | Legacy-route regression tests and source search |
| UX-01 | Provide semantic labels, keyboard access, visible focus, descriptive errors, status announcements, reduced motion, and responsive layout without horizontal overflow at 360px. | Keyboard/manual accessibility pass plus available tooling |
| UX-02 | Label all demo/testnet states visibly. Real empty profiles do not borrow demo records. If database/RPC is unconfigured, show an honest unavailable state. | Preview and missing-config review |
| UX-03 | Use consistent shared components for profile, payment and verification. Keep critical payment and privacy text visible before action. | Page/component inventory and representative screenshots |

## Validation rules

These limits match `src/lib/domain.ts`, profile services and receipt creation at reconciliation time.

| Field | Rule |
|---|---|
| Handle | 3–32 ASCII lowercase letters/digits/interior hyphens; reserved names excluded; one per wallet per network |
| Display name | Optional, trimmed, at most 60 characters; clear using empty string |
| Bio | Optional plain text, at most 280 characters; clear using empty string |
| Contribution statement | Required trimmed plain text, 10–600 characters; no separate title |
| Evidence URL | Optional HTTPS URL, input at most 1,000 characters; reject embedded credentials and non-HTTPS schemes. Current implementation does not reject localhost/private hosts and does not fetch previews server-side |
| Amount | `amountNim` is a decimal string with at most five decimals; positive Luna capped at 100,000,000,000,000 (1 billion NIM); BigInt storage and string JSON serialization |
| Transaction hash | Canonical expected byte-length hex, normalized; network-scoped unique |
| Signature/public key | Expected hex format/length, verified with appropriate Nimiq library; format checks alone never count as verification |
| Publish | Explicit boolean action from authenticated recipient after receipt completion |
| Draft idempotency key | 16–80 ASCII letters/digits/hyphens; unique within issuer |
| JSON body | Object only; bounded at 12,000 bytes; no unrestricted file upload |

## State and recovery specification

Persist payment and signature state separately from visibility. Do not overload `published` to imply payment confirmation.

| Trigger | User-visible outcome | Safe action |
|---|---|---|
| Provider still loading | Connecting to Nimiq Pay | Wait or retry initialization |
| No provider | Open in Nimiq Pay | Open supported link or inspect public pages |
| Challenge rejected/expired | Sign-in not completed | Request a new challenge; do not mutate identity |
| Handle race | Name has just been claimed | Preserve input and choose another name |
| Wallet payment cancelled | Payment was cancelled | Return to review; no transaction recorded |
| Wallet payment timeout | Payment status needs checking | Reconcile existing reference; do not auto-pay again |
| Hash returned, RPC not yet seeing it | Payment pending | Retry verification against same hash |
| RPC unavailable | Verification temporarily unavailable | Preserve record; retry with backoff |
| Wrong transaction supplied | Payment does not match this contribution | Explain mismatch; do not issue completed receipt |
| Payment matches, acknowledgment cancelled | Payment recorded; acknowledgment needed | Resume signature without repayment |
| Receipt complete and private | Ready for recipient review | Recipient can publish after reading disclosure |
| Publish request fails | Receipt remains private | Retry publication; preserve proof |

## Permissions matrix

| Action | Visitor | Issuer | Recipient | Other authenticated wallet |
|---|---:|---:|---:|---:|
| Read public profile/receipt | Yes | Yes | Yes | Yes |
| Read private contribution | No | Yes | Yes | No |
| Edit own profile | No | Own only | Own only | Own only |
| Create acknowledgment draft | No | Yes | As issuer of another contribution | As issuer of another contribution |
| Attach transaction / sign acknowledgment | No | Yes | No | No |
| Retry payment verification / reconcile reference | No | Yes | No | No |
| Publish or unpublish receipt | No | No | Yes | No |
| Edit signed receipt facts | No | No | No | No |

## Minimum acceptance evidence

Tests must prove authority boundaries and recovery behavior, not merely mirror helper code. Include a valid signature fixture, wrong wallet, mutated canonical message, expired/replayed challenge, duplicate transaction concurrency, mismatched chain data, private-read leak check, and sender-versus-recipient publish authorization. Record real-device checks separately from mocks. A build pass does not establish Nimiq Pay compatibility.

## Final compatibility details

ID-01/ID-02: legacy names remain reserved for the original wallet; availability reports this distinction. No legacy credibility is imported. PAY-01/PAY-02: payment begin includes an RPC-network readiness check before the native approval is requested. An outage leaves the draft unchanged. PAY-05/PAY-06: wallet results accept documented hash and serialized-transaction variants, but neither variant bypasses independent verification. See the final API amendments and the passing native PostgreSQL lifecycle checks in VALIDATION.md.
