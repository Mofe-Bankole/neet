# Dotneet — Security and Privacy Requirements

**Revision:** 1.0 · **Source review:** 11 September 2026. This document reports source-visible controls and release requirements. It does not claim an independent penetration test, production deployment, physical-device approval test or security certification.

## Security objective

Only the wallet that proves control can claim/edit its `.neet` profile, issue an acknowledgment or take issuer actions. Only the intended recipient can publish a private receipt. A receipt reports independently checked transfer facts and an attributable statement; it is never a universal trust rating.

Dotneet must not receive private keys, seed phrases or wallet spending authority. Nimiq Pay approves each sensitive native operation. The backend queries a read RPC and verifies signatures; it never initiates a transfer.

## Assets and threat boundaries

| Asset | Relevant threat | Control / required evidence |
|---|---|---|
| Wallet-to-name association | Attacker supplies another address | Exact signed challenge, derived-address verification, session-owned claim; AUTH-02–04, ID-02 |
| Session | Theft, fixation, replay, cross-origin request | 32-byte random cookie token, hashed DB value, Strict SameSite, HttpOnly, HTTPS Secure, origin checks, expiry/logout |
| Challenge | Replay from another browser or after expiry | Browser-binding cookie hash, 300-second expiry, unique random nonce, atomic one-time consumption |
| Payment | Fake hash, wrong amount/recipient/network, duplicate attribution | Server RPC and exact marker/transaction validation; unique network+hash |
| Wallet attempt | Late rejection/result overwrites newer state | Random attempt token, exact-token rejection/attachment, conditional state changes |
| Recovery | Attacker substitutes another transfer | Issuer-only independent matching-candidate check before conditional recovery; never after signing |
| Acknowledgment | Changed statement or signer | Stored canonical challenge, nonce/expiry, exact crypto proof, derived issuer address, conditional signing |
| Private receipt | Unauthorized read/publication or hidden-field leak | Participant checks, recipient-only consent, shared public eligibility, safe serializers/no-store |
| Availability | Expensive write/crypto/RPC abuse | Bounded JSON body, persistent atomic rate buckets, RPC timeout; verify public-read/publication coverage |

## Implemented authentication choices

`src/lib/server/auth.ts` issues a canonical ASCII JSON sign-in request with schema, purpose, origin, network, canonical address, random nonce and expiry. Its exact text is stored. The browser receives a separate HttpOnly `dotneet_challenge` cookie; only its hash is stored in AuthChallenge. Verification must match both cookie binding and signature, then atomically mark the challenge used before session issuance.

`src/lib/server/crypto.ts` accepts expected public-key/signature hex lengths, derives and compares the Nimiq address, and verifies the Nimiq framed SHA-256 message using `@nimiq/core`. The selected prefix is `\x16Nimiq Signed Message:\n` followed by the message's UTF-8 byte length. All application-generated challenge strings use ASCII-escaped JSON. Native Nimiq Pay compatibility still requires an actual device signature fixture; a self-generated matching fixture alone is insufficient.

`dotneet_session` stores the raw random token only in a cookie. WalletSession stores a SHA-256 hash. Session lifetime is 24 hours, challenge lifetime five minutes; both are enforced server-side. Authentication establishes wallet control, not personhood. `verifiedAt` on WalletProfile records creation under this system, not a recurring KYC check.

For LAN mobile testing, set APP_ORIGIN to the exact LAN origin used by the phone and restart the app. A localhost origin in configuration with a LAN-origin request is correctly rejected. Production requires an HTTPS origin with no path/trailing slash. Never weaken the origin comparison to make a test pass.

## Payment security contract

The server stores the intended parties/amount before payment. The wallet transfer includes only an opaque `dotneet:<receiptId>` marker. Independent verification checks hash, configured network, sender, recipient, exact Luna value, marker bytes, basic account types, flags, execution result, inclusion height and configured confirmations. A generic historical payment without the marker does not qualify.

`CONFIRMED` means matching inclusion met the configured threshold at check time; default is ten confirmations. It is not deterministic finality or a guarantee about future RPC observations. Public UI and API must show network, policy/check timestamp and plain-language limits. Production RPC access uses HTTPS and a configured endpoint; no fallback invents confirmation.

**No automatic repayment rule:** Only a direct user action may request a native transfer. Begin returns a fresh attempt token. Explicit native rejection may reset that exact attempt; timeout/unknown response must not. Recovery validates a candidate hash without spending. Reference replacement is permitted only for an unsigned AWAITING_WALLET/SUBMITTED receipt after the complete candidate check succeeds and prior state/hash still match.

If users deliberately approve multiple transfers, the application cannot reverse them. Its responsibility is not to cause an accidental repeat through retries, reloads, or stale callback handling.

## Acknowledgment integrity

Payment verification precedes POST acknowledgment challenge generation. The canonical receipt facts plus nonce/expiry are signed exactly as received. A challenge request must not overwrite a concurrently verified signature. Sign submission must match the current stored message and expiry. After signature, the bound receipt facts and payment reference cannot change.

Cancellation of the signature approval leaves a paid but unsigned receipt with a clear “Sign acknowledgment” recovery action. Retrying that action must never call payment again.

Issuer withdrawal is an authenticated hosted-state action recorded as `withdrawnAt`; it is not a new cryptographically signed revocation message. The original signed statement remains inspectable historical evidence. Do not imply that withdrawal invalidates its signature, erases blockchain data, or returns funds.

## Publication and disclosure

The contributor's new profile is public after claim; explain wallet/name association before claim. A contribution receipt starts private to issuer and recipient. Recipient publication must show that statement, evidence link, both wallet associations, amount, transaction reference and signed acknowledgment become public. Require explicit `consent:true` for publishing.

Unpublication prevents future public responses from Dotneet. Copies, cached third-party data and blockchain transfers can remain elsewhere. Previously published withdrawn receipts remain public historical records until recipient unpublishes; exclude them from active counts and label them prominently. A withdrawn receipt cannot be newly published.

Do not expose private receipt existence through public counts, previews, Open Graph metadata or cached pages. Public profile counts describe the displayed maximum-50 set and wallets, not all-time totals or human users. `idempotencyKey` is never serialized. `paymentAttemptId` may appear only in participant-authorized responses, including the generic receipt-detail endpoint.

## Input and content controls

- JSON object bodies are limited to 12,000 bytes before expensive verification.
- Profile fields accept bounded plain text; only displayName and bio are editable. Extra owner/network fields must not affect authorization.
- Handle format is ASCII-only and reserves application route/product names, reducing some homograph/routing problems; it does not certify brand ownership.
- Evidence URL is optional HTTPS, at most 1,000 input characters, with no embedded credentials. Current implementation performs no server-side preview fetch and does not block every private/local host. Render it as a plain external link and do not add auto-fetching without an SSRF review.
- No user HTML, script injection or arbitrary file upload is needed for the MVP.
- NIM input is a decimal string parsed into exact Luna; amount storage uses BigInt and JSON output a string.
- Logs show safe failure class/action rather than full tokens, challenge content, signatures, evidence URLs or RPC credentials.

## Rate limits and maintenance

RateLimitBucket uses database atomic increments rather than per-process memory. Current configured examples are challenge global 300/minute plus address 8/minute; auth verification global 500/minute plus challenge 6/minute; claim 6/minute; profile edit 20/minute; draft create 20/minute; issuer receipt writes 60/minute. Confirm final call sites before release. Final source coverage adds public reads600/minute globally, receipt reads600/minute and publication20/minute per wallet. Verify those scopes in the PostgreSQL test evidence; layered hosting protections remain an operational choice.

Expired challenge/session/rate buckets need a documented cleanup procedure and retention policy. Expiry checks must continue to work even if cleanup is delayed. Backups must be treated as private application data. Never log or include production credentials in handoff files.

## Migration and limits of the product

Keep legacy unverified identity/points/endorsement data isolated. New WalletProfile creation requires authentication. Do not silently overwrite or mass-delete existing production records. Rehearse additive migrations and verify rollback in an authorized staging environment.

Colluding wallets can still manufacture positive acknowledgments. A large amount does not establish quality. A contributor's new name does not erase a person's history elsewhere. Dotneet cannot prove that two wallets correspond to two people, and should never market its displayed counts as a Sybil-proof reputation system.

## Release gates

Block production-readiness claims for any unresolved unauthorized mutation, private-data leak, wrong-payment acceptance, post-sign mutation, replay/concurrency failure, or untested native signature/payment compatibility. These are concrete product requirements, not a request to pause ordinary local implementation work. Run the test plan and report evidence; do not claim checks that were not performed.
