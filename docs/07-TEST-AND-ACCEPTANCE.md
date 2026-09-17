# Dotneet — Testing and Acceptance Plan

**Revision:** 1.0 · **Prepared:** 11 September 2026.

**Execution status:** The final local unit and native PostgreSQL lifecycle checks passed; see [VALIDATION.md](VALIDATION.md) for the exact scope. The catalogue below defines release acceptance and includes additional device/production cases that were not exercised. It is not an assertion that every listed case passed.

## Evidence levels

| Level | What it establishes | What it does not establish |
|---|---|---|
| Static source review | Intended control/route/model exists in reviewed source | Control behaves correctly under execution |
| Unit fixtures | Helpers reject/accept selected inputs | Native wallet compatibility or real network behavior |
| Local route + PostgreSQL18.4 tests | HTTP/session/state/constraints and exercised concurrency cases on a real disposable PostgreSQL instance | Hosted production configuration, unexercised load patterns or physical WebView cookies |
| Browser visual/interaction checks | Reviewed sizes, keyboard paths and preview state | Native payment/sign approvals or real users |
| Physical Nimiq Pay testnet | Actual account/sign/payment workflow on tested device/version | Mainnet deployment reliability or adoption |
| Authorized live pilot | Specific observed real contribution/payment journey | Broad demand, guarantees or winner status |

Never merge these evidence categories into “everything tested.” Record tested commit, date, runtime, network, device/version and limits.

## Available command entry points

Current package scripts expose `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`, `npm run build`, and `npm run db:local`. Node requirement is >=22.13.0. The existence of a script does not mean its test files exist or the command passed. Read the final README/setup guide and test source before running. The delivered source includes all listed test files and page implementations.

Use an actual PostgreSQL database named dotneet_test on localhost/127.0.0.1, supplied explicitly through DOTNEET_TEST_DATABASE_URL, and deterministic mock RPC for negative/concurrency cases. Tests reject a missing variable or other database name/host. Test data must never be migrated into live usage statistics. A separate physical-device flow supplies native compatibility evidence.

## Detailed acceptance matrix

Use the final validation-to-requirement mapping to identify exercised cases. Any native-device, real-RPC, production-load or accessibility case not recorded there remains open.

| Test | Setup / action | Expected result | Requirement |
|---|---|---|---|
| A01 | Challenge with valid wallet; inspect response/cookies/database | Exact canonical stored message; five-minute expiry; browser binding; no raw session token in JSON | AUTH-02 |
| A02 | Sign exact supported challenge using known key; submit correct key/signature | Derived address matches; one session; cookie HttpOnly/Strict and Secure over HTTPS | AUTH-03–04 |
| A03 | Wrong key, wrong wallet, altered message, invalid hex/length | 401/validation failure; no session | AUTH-03 |
| A04 | Expired, used, unknown challenge; absent/different challenge cookie | Rejected; no profile/session mutation | AUTH-03 |
| A05 | Submit valid challenge concurrently twice | At most one session issued; second cannot replay consumed challenge | AUTH-03 |
| A06 | Wrong Origin, missing Origin, localhost/LAN mismatch | Protected mutations rejected; test configuration fixed without weakening check | AUTH-02–04 |
| A07 | Reload valid session, expire session, logout, switch active wallet | Same owned profile recovered; expired/logged-out/stale wallet has no write authority | AUTH-04–05 |
| N01 | Handle uppercase/suffix, min/max bounds, underscores, outside hyphen, reserved name | Correct normalized 3–32 rules and useful conflict/errors | ID-01 |
| N02 | Concurrent same handle/different wallets; same wallet/different names | Network-scoped uniqueness; no duplicate ownership | ID-02 |
| N03 | Reuse current wallet+same handle claim; patch another profile ID in body | Idempotent same claim; only own profile fields change | ID-02, PROFILE-02 |
| N04 | Legacy identity/points present | Absent from new verified profile API; retired routes cannot write | ID-03, API-03 |
| D01 | Valid draft; statement bounds; unsafe amount; invalid evidence; self recipient | Correct validation; no title field required; private draft created only when valid | ACK-01 |
| D02 | Same idempotency key concurrently with same/different payload | Original result reused when matching; mismatched payload conflicts | PAY-05 |
| P01 | Amount string decimals at 0/5/6 digits, negative, exponent, huge integer | Exact positive supported Luna only; no floating-point error | PAY-01 |
| P02 | Begin twice concurrently | One active attempt token; no duplicate wallet prompt from successful state update | PAY-05 |
| P03 | Reject using current token versus stale token after newer begin | Current explicit rejection can reset; stale callback cannot reset newer attempt | PAY-05 |
| P04 | Attach correct token/hash versus missing/stale token/different existing hash | Only correct active attempt attaches; normal replacement denied | PAY-02, PAY-05 |
| P04b | Attach 64-hex walletResult, valid serialized transaction, malformed/oversized/noncanonical encoding | Safe parsing only; invalid result stays recoverable without repayment; independent verification still required | PAY-02 |
| P05 | RPC transaction matches parties/value/network/hash but lacks correct marker | PAYMENT_MISMATCH; never confirmed | PAY-03 |
| P06 | Wrong sender/recipient/network/value, non-basic types, flags, failed execution | Fail closed; no complete receipt | PAY-03 |
| P07 | Missing transaction, malformed RPC, wrong JSON-RPC ID, missing config, wrong RPC network, timeout | Pending/unavailable safe outcome; no fabricated confirmation and no retry transfer | PAY-04 |
| P08 | Matching successful included transaction below/at configured threshold | HTTP202 pending below threshold; CONFIRMED only at threshold; recorded policy/count/time | PAY-04 |
| P09 | HTTP202 with error-shaped body | Client renders pending, despite response.ok=true | PAY-04, UX-03 |
| P10 | Duplicate network+hash across receipts, concurrent attachment/recovery | Unique constraint; at most one record attributes transaction | PAY-05 |
| P11 | Unknown wallet outcome/reload with no saved hash | No reset to unpaid; offer reconciliation without resending | PAY-06 |
| P12 | Reconcile bad hash then fully matching candidate; race another state/hash update | Bad candidate leaves record unchanged; valid candidate conditional replace+confirm; stale CAS fails | PAY-06 |
| P13 | Reconcile after signature or CONFIRMED; verify old hash racing successful reconcile | Post-sign replacement denied; stored proof metadata stays associated with the actual current hash | PAY-05–06 |
| S01 | POST acknowledgment action challenge after confirmation; try GET/pre-confirmation | Only POST generates; pre-confirmation denied | ACK-02 |
| S02 | Two concurrent expired-challenge generations / generation races signing | No overwrite of verified signature; current challenge wins consistently | ACK-02–03 |
| S03 | Sign exact message; alter statement, amount, evidence, hash or nonce | Only exact current signed message accepted | ACK-02–03 |
| S04 | Expire acknowledgment before submit; sign once then wait past challenge expiry | Late submission denied; already accepted historical acknowledgment remains valid | ACK-03 |
| S05 | Cancel native acknowledgment after payment and reload | Resume signing same receipt without another payment | ACK-04 |
| R01 | Stranger reads private receipt via generic/public endpoint, profile, metadata and totals | Not found/no private content or aggregate leakage | RECEIPT-02 |
| R02 | Inspect published receipt through both generic and v1 routes | No idempotencyKey or paymentAttemptId for public reader | RECEIPT-02, API-01 |
| R03 | Issuer/stranger publishes; recipient publishes missing consent; recipient valid publication | Only recipient with explicit consent and complete active proofs succeeds | RECEIPT-02 |
| R04 | Recipient unpublishes; retry public page/API after prior read | New responses deny public access; no stale cache | RECEIPT-03 |
| R05 | Issuer withdraws published acknowledgment | Historical public record marked withdrawn; active count decreases; signature remains historical | RECEIPT-06 |
| R06 | Publish races withdrawal | No newly-public active receipt after withdrawn-state transition; conditional checks match policy | RECEIPT-06 |
| R07 | Cancel unpaid draft versus awaiting/submitted/confirmed | Only DRAFT can cancel; state never implies refund | RECEIPT-06 |
| I01 | Public profile with >50 eligible records incl withdrawals | Latest50 displayed, counts named displayed*, active counts exclude withdrawn; no false all-time totals | API-01–02 |
| I02 | Self list limit/cursor including negative/fractional/malformed values | Valid bounds/order; missing/zero/non-numeric→20, fractional floor, clamp1–50 before database | API-02 |
| I03 | Cross-origin v1 GET/OPTIONS; protected mutation cross-origin | Public noncredentialed read works; writes denied | API-01–02 |
| I04 | Exceed implemented rate limits concurrently; exercise public read/availability/publication paths | Atomic enforced limits or explicit hosting-layer controls; no undocumented uncovered path | API-02 |
| U01 | Ordinary browser, delayed provider, denied wallet permission | Useful fallback/loading/retry; no fake connection | AUTH-01 |
| U02 | Demo preview versus live missing database/RPC | Preview labeled fictional; live explains unavailable dependency; demo never writes live data | UX-02 |
| U03 | Keyboard-only complete journey and status announcements | Logical focus, clear labels/errors, no inaccessible action | UX-01 |
| U04 | 360px mobile, representative desktop, reduced motion, long names/amounts/evidence | No clipping/overflow, readable content, complete actions | UX-01, UX-03 |
| U05 | Clipboard available/unavailable on normal browser and LAN WebView | Published receipt URL only, clipboard copy or displayed manual fallback; no native Web Share implementation claimed | RECEIPT-05 |

## Native device procedure

1. Set a disposable test database and reliable history-indexed testnet RPC. Set APP_ORIGIN to the exact phone-accessible origin.
2. Use Nimiq Pay configured for testnet and testnet NIM. Record device OS and app version. No real-money payment is required for this gate.
3. With two separate test wallets, claim two profiles through native challenges. Retain redacted signature test evidence proving server compatibility with actual provider output.
4. Create a genuine test statement labeled test, pay with the opaque receipt reference, observe pending/confirmed policy, then sign the acknowledgment.
5. Switch to recipient, inspect private receipt, publish with disclosure, inspect public view in an ordinary browser, then unpublish.
6. Repeat selected interruption paths: explicit payment rejection, unknown/timeout recovery where practical, acknowledgment cancellation, reload, sign-in expiry and account switch.
7. Record expected/actual results and defects. A desktop browser preview is not a substitute.

## Evidence record template

| Field | Entry |
|---|---|
| Case ID / linked requirement | Pending |
| Commit / environment / date | Pending |
| Network / RPC type / device version | Pending |
| Inputs / setup | Pending; do not include secrets |
| Expected / actual | Pending |
| Result | Pending / Passed / Failed / Blocked |
| Artifact / redacted screenshot / command log | Pending |
| Limitation or follow-up | Pending |

## Acceptance decisions

**Reviewable local handoff:** docs/code agree, local setup is reproducible, demo/live states separate, checks and screenshots are recorded honestly.

**Testnet-ready:** native signatures and payments on actual Nimiq Pay, matching configured RPC verification, private/public authorization, interrupted-payment recovery and critical concurrency cases pass.

**Production-ready:** authorized hosted migration and HTTPS session behavior proven, intended-network RPC confirmed, operational responsibility/rollback assigned, critical security/privacy defects closed. Do not infer hosted readiness or real-wallet compatibility solely from local PostgreSQL/mock-RPC tests.

**Competition claim:** only measured actual usage and available behavior appear in demo/submission. No simulated record counts as a live contribution. Root's final validation report must replace pending labels only with evidence it actually obtained.
