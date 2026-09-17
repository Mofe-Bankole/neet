# Dotneet — Eight-Day Implementation and Verification Plan

**Revision:** 1.1 · **Reconciled:** 11 September 2026 · **Status:** Ordered delivery plan. Do not interpret unchecked targets as completed work. Use the final implementation-status document and recorded command/device results to determine where continuation begins.

## Working rules for OpenCode

1. Read the central index, PRD, FRD, architecture, data/API contract, security/privacy guidance, design system and actual implementation-status report.
2. Inspect the handed-over code and `AGENTS.md`; follow installed Next.js 16 documentation for framework-specific behavior.
3. Continue from the existing checkout. Preserve useful code and user changes. Do not redo completed work merely because this plan contains it.
4. Keep one Node-based Next.js service and Prisma/PostgreSQL. Use actual PostgreSQL locally: the supplied Compose18.4 service or a native installation. Integration tests require an explicit loopback dotneet_test database.
5. Resolve routine implementation choices and document assumptions. Stop only dependent work when credentials, device access or a product decision are truly required.
6. Each completed task must name its requirement IDs, changed components, verification evidence and remaining limitations.
7. Never report demo interactions, mocked RPC fixtures or a build pass as real Nimiq Pay/mainnet integration.
8. Public deployment, public posts, outreach and real-money transfers require the appropriate explicit authorization; preparing reviewable code and instructions does not.

## Ordered tasks

### T01 — Establish a safe baseline

**Prerequisites:** Repository access; the source snapshot identified in architecture.

**Files/components:** `package.json`, lockfile, `AGENTS.md`, `prisma/schema.prisma`, existing `src/app/api` routes, `src/lib/nimiq.ts`, existing docs.

**Work:** Record branch/commit and install using the lockfile; inspect SDK branch without blindly merging old score semantics; run baseline checks; isolate legacy schema; retire unsafe points/posts/endorsement routes; remove score claims from current UI and docs; create explicit demo/live separation.

**Requirements:** API-03, UX-02; foundation for AUTH/ID/PAY.

**Acceptance:** Retired routes cannot mutate any record; new pages do not claim old endorsements are verified; repository status and actual baseline failures are documented.

**Verification:** V01, V15, V18. No live exploit tests or destructive data changes are required.

### T02 — Add wallet ownership authentication and durable sessions

**Prerequisites:** T01; supported server crypto library; configured origin.

**Files/components:** Auth challenge/verify/session/logout routes, Nimiq client adapter, shared signature validation, `AuthChallenge`, `WalletSession`, `RateLimitBucket`.

**Work:** Generate exact expiring origin/network/wallet challenge; preserve public key/signature from provider; validate signature plus derived wallet; consume nonce atomically; hash session token and send safe cookie; enforce same-origin writes; recover/logout sessions; handle delayed provider and account changes.

**Requirements:** AUTH-01–AUTH-05.

**Acceptance:** Browser-supplied address cannot create an authenticated session; wrong-wallet/replayed proofs fail; valid returning session retrieves its wallet/profile; account switch cannot retain stale authority.

**Verification:** V02–V05. Native fixture compatibility is a release gate even if locally generated signature tests pass.

### T03 — Secure names and profiles

**Prerequisites:** T02 and new WalletProfile schema.

**Files/components:** `/api/identity/claim`, `/api/profile`, WalletProfile, onboarding and profile pages, handle/profile validators.

**Work:** Normalize handles; reserve route/product names; enforce `(network, handle)` and `(network, address)` uniqueness; use session ownership for claim and edit; preserve real empty state; load existing identity after authentication; disclose public wallet association.

**Requirements:** ID-01–ID-03, PROFILE-01–PROFILE-03.

**Acceptance:** Concurrent claims are safe; wrong-owner profile changes fail; legacy records remain isolated; returning user never needs a second claim.

**Verification:** V06–V08.

### T04 — Create immutable contribution drafts and recovery

**Prerequisites:** T03.

**Files/components:** `/api/receipts` GET/POST, receipt detail/cancel routes, ContributionReceipt model, contribution form/review UI.

**Work:** Capture recipient, statement, optional safe evidence link, integer amount and network; store draft before wallet action; implement issuer-scoped idempotency; restrict private reads to participants; cancel only unpaid drafts; preserve draft/recovery information through reload.

**Requirements:** ACK-01, PAY-05–PAY-06, RECEIPT-06.

**Acceptance:** Duplicate draft submission returns the same intent or a clear conflict; private records are not visible to strangers; no cancellation suggests reversal of a sent transfer.

**Verification:** V09, V12–V13.

### T05 — Native payment and independent verification

**Prerequisites:** T04; configured read RPC; Nimiq Pay test device for native validation.

**Files/components:** Nimiq adapter, `/api/receipts/[id]/payment`, `/verify`, server RPC adapter, payment review/status UI.

**Work:** Parse NIM as integer Luna; show recipient/network/amount and native fee context; begin a token-bound wallet attempt; request native payment with opaque receipt reference; attach hash with exact attempt token; independently check sender/recipient/amount/network/reference/execution/inclusion; apply the configured default-10 confirmation policy without a finality claim; permit only independently verified recovery for unsigned unfinished records; show transient verification outcomes honestly.

**Requirements:** PAY-01–PAY-06.

**Acceptance:** A submitted hash or RPC outage cannot create a confirmed receipt; mismatch is explained; retry does not invoke another transfer; duplicate network+hash is rejected atomically.

**Verification:** V10–V13. Record actual network and device evidence separately from fixture tests.

### T06 — Signed acknowledgment and completed receipt

**Prerequisites:** T05 and compatible signature verifier from T02.

**Files/components:** `/acknowledgment` POST challenge/sign actions, canonical-message service, receipt detail UI, immutable proof storage.

**Work:** After payment verification, POST `action: "challenge"` to obtain a five-minute nonce-bound ASCII-escaped JSON message binding contribution/payment facts; request native signing; validate exact bytes and signer; store proof and verification timestamp; derive completion from both proof states; allow signing recovery after a paid-but-unsigned interruption.

**Requirements:** ACK-02–ACK-04, RECEIPT-01, RECEIPT-04.

**Acceptance:** Modified statement/recipient/amount/network/hash cannot retain a valid acknowledgment; signature-only and payment-only records are visibly incomplete; signing again does not pay again.

**Verification:** V03, V11–V12, V14.

### T07 — Recipient publication, sharing and withdrawal

**Prerequisites:** T06.

**Files/components:** `/publish`, `/withdraw`, public receipt/profile projections, share UI, metadata.

**Work:** Private default; explicit recipient disclosure and publish action; issuer cannot publish; unpublish removes future public access; define issuer withdrawal without erasing signed history; public count uses qualifying public records only; copy the published URL with a manual fallback.

**Requirements:** RECEIPT-02–RECEIPT-06, PROFILE-01.

**Acceptance:** Private content is absent from public page, API, metadata and totals; publication authority tests pass; copy failure shows a usable manual URL.

**Verification:** V14–V16.

### T08 — Public API and one thin integration example

**Prerequisites:** T07.

**Files/components:** `/api/v1/profiles/[handle]`, `/api/v1/receipts/[id]`, shared public serializer, read API types/example.

**Work:** Expose public facts with network/provenance; safe CORS and cache policy; ID-descending self-list cursor/default20/max50, capped public-profile display without a public cursor; stable errors; provide a small consumer example and no write SDK.

**Requirements:** API-01–API-02.

**Acceptance:** API exactly matches page visibility; unavailable/private records handled predictably; example can render actual eligible data when available and shows unavailable state otherwise.

**Verification:** V15–V17. An example is not an external partnership or usage metric.

### T09 — Apply design system and complete pages

**Prerequisites:** Design foundations; work can begin alongside T02–T08 once contracts are stable.

**Files/components:** Token files, global styles, shared UI components, landing/onboarding/profile/contribution/receipt pages, separate `/preview`, component gallery, cross-format examples.

**Work:** Consistent semantic tokens; readable content hierarchy; keyboard/focus/error behavior; network/demo labeling; informative loading and empty states; 360px responsive layout; representative deck/social/document templates without a sprawling asset-production phase.

**Requirements:** UX-01–UX-03 and page representation of all functional requirements.

**Acceptance:** Core actions remain clear and truthful; no decorative badge implies human verification; pages use shared components; documented screenshots match the current code.

**Verification:** V18–V20 and design review.

### T10 — Release validation and operating instructions

**Prerequisites:** T01–T09 essential features.

**Files/components:** Tests, migration/setup scripts, environment example, build configuration, security/operations/status docs.

**Work:** Run meaningful regression tests, type/lint/build checks, isolated database tests, native-device flow, keyboard/mobile review; capture exact evidence; document local Linux setup, migration and rollback; repair actual failures.

**Requirements:** All retained IDs.

**Acceptance:** No unresolved critical authorization/payment/privacy defect; every completion claim has evidence; untested environments are explicit. Public deployment remains separately authorized.

**Verification:** All applicable V cases; mark blocked/unperformed honestly.

### T11 — Observe pilot and prepare transferable handoffs

**Prerequisites:** Reliable core; owner authorization for outreach or public activity.

**Files/components:** Pilot notes template, issue list, central index, OpenCode prompt, Claude prompt/manifest, screenshots, submission draft.

**Work:** Prepare recruitment and observation instructions; collect actual participant evidence only when authorized; summarize results with sample size; freeze scope; package docs and code; explain protected payment/privacy behavior to Claude; provide alternative screenshot-only review instructions.

**Acceptance:** Another agent can reproduce preview, find files, distinguish demo/test/live evidence and continue without conversation history. External actions are not implied by a prepared prompt.

## Verification catalogue

These are specified checks, not a claim they have already run.

| ID | Check | Expected result |
|---|---|---|
| V01 | Baseline/package and migration inspection | Exact starting version and additive schema plan recorded |
| V02 | Provider absent, delayed and rejected permission | Useful state/retry; no false authenticated UI |
| V03 | Correct signature; altered message/key/wallet; non-ASCII source text | Only exact supported canonical signed bytes verify |
| V04 | Expired/unknown challenge; two concurrent replay attempts | At most one valid session issuance |
| V05 | Session reload/logout/expiry; account switch | Correct identity recovery and authority invalidation |
| V06 | Handle case/suffix/invalid/reserved forms | One normalized key; clear validation |
| V07 | Concurrent same handle and same wallet claims | Database uniqueness preserved |
| V08 | Own versus other profile patch | Owner succeeds; unrelated session fails |
| V09 | Same/different payload idempotency reuse | Original intent reused or conflict; no duplicate draft |
| V10 | Decimal parsing, unsafe integers, zero/negative amounts | Exact valid Luna only |
| V11 | RPC correct/wrong sender/recipient/value/network/execution; absent/included/confirmed/unavailable | Correct distinct payment state; fail closed |
| V12 | Cancel payment/signing; timeout/reload after payment | No automatic second transfer; signing recovery works |
| V13 | Concurrent duplicate network+hash; stale attempt token; normal replacement and validated reconciliation | At most one binding; stale attempts denied; only independently matching unsigned recovery may replace hash |
| V14 | Unsigned, pending, complete private, published, withdrawn receipt | Completion and publication use correct independent conditions |
| V15 | Stranger reads via API/page/metadata/list/count/cache | No private facts or private aggregate leakage |
| V16 | Issuer/recipient/stranger publish and unpublish | Recipient only; unpublish removes future public access |
| V17 | Cross-origin public read; malformed limit/cursor; throttling | Public reads work; credentials/private writes do not cross boundaries |
| V18 | Demo versus live with missing database/RPC | Clear fictional/offline labels; no simulated success in live routes |
| V19 | Keyboard, focus, status announcements, 360px overflow, reduced motion | Core journey remains usable |
| V20 | Representative desktop/mobile screenshots and actual Nimiq Pay device flow | Visual quality established for reviewed sizes; device evidence separately recorded |

## Complete traceability map

| Requirement IDs | Tasks | Verification |
|---|---|---|
| AUTH-01 | T02, T09 | V02, V20 |
| AUTH-02–AUTH-03 | T02 | V03–V04 |
| AUTH-04–AUTH-05 | T02–T03 | V05 |
| ID-01 | T03 | V06 |
| ID-02 | T03 | V07 |
| ID-03 | T01, T03 | V01, V08, V18 |
| PROFILE-01 | T03, T07 | V14–V16 |
| PROFILE-02–PROFILE-03 | T03 | V05, V08 |
| ACK-01 | T04 | V09–V10 |
| ACK-02–ACK-03 | T06 | V03, V11, V14 |
| ACK-04 | T06 | V12 |
| PAY-01 | T05, T09 | V10, V20 |
| PAY-02–PAY-04 | T05 | V11, V20 |
| PAY-05–PAY-06 | T04–T05 | V09, V12–V13 |
| RECEIPT-01 | T06 | V11, V14 |
| RECEIPT-02–RECEIPT-03 | T07 | V15–V16 |
| RECEIPT-04 | T06–T07, T09 | V03, V11, V14, V20 |
| RECEIPT-05 | T07, T09 | V19–V20 |
| RECEIPT-06 | T04, T07 | V12, V14, V16 |
| API-01–API-02 | T08 | V15, V17 |
| API-03 | T01 | V01, V15 |
| UX-01 | T09 | V19–V20 |
| UX-02 | T01, T09 | V18 |
| UX-03 | T09 | V19–V20 |

## Eight-day schedule and cut lines

| Day | Primary outcome | Checkpoint / cut line |
|---|---|---|
| 1 | Baseline audit, critical legacy closure, auth/signature spike, chosen design foundations | If native signature compatibility is unresolved, prioritize it before polishing pages |
| 2 | Signed sessions, secure claim/edit, persistent new schema, returning-user flow | No payment work on top of unauthenticated identities; cut profile imagery/search if behind |
| 3 | Draft/review/native payment/hash persistence/independent verification | Test amount/address/network mismatch; drop optional integration until reliable |
| 4 | Canonical acknowledgment, paid-but-unsigned recovery, private receipt, recipient publication | Core end-to-end flow must exist; cut all marketplace/social/score additions |
| 5 | Public profile/API, mobile/keyboard polish, error and reload states | Keep API narrow; integration example can remain read-only helper |
| 6 | Observed real-device testing and small genuine pilot; fix friction | Add no new core feature; record real results, including failures |
| 7 | Regression/security checks, screenshots, demo recording, docs/code reconciliation | Freeze features; critical fixes only |
| 8 | Buffer, submission materials, OpenCode/Claude handoff, final acceptance | Submit through appropriate authorized owner workflow; do not trade safety/privacy correctness for scope |

The schedule is a planning allocation, not an instruction to wait eight days. Finish available work now and identify external gates. If the implementation is already partly complete, start at the first unmet acceptance condition.

## Release gates

**Local reviewable package:** reproducible local preview; documented design system; truthful demo separation; runnable checks; manifest and screenshots; explicit gaps.

**Real-device testnet-ready:** configured database/RPC, ownership and signature compatibility proven against native Nimiq Pay, positive and negative payment tests, publication/privacy checks, no unresolved critical defects.

**Production-ready claim:** hosted PostgreSQL migration rehearsed; intended network configuration verified; native session/cookie behavior tested over HTTPS; production RPC/inclusion-confirmation policy checked; authorized live pilot evidenced; operational ownership and rollback documented. A local PostgreSQL/mock-RPC suite cannot establish the intended hosted deployment or actual Nimiq Pay/RPC behavior by itself.

**Competition-ready claim:** usable live Mini App, current official submission requirements checked, public repository/license requirements satisfied by owner, measured usage stated honestly, demo reflects actual available behavior. Handoff preparation alone is not submission.

## Immediate OpenCode continuation prompt

> Continue Dotneet from the delivered checkout using Linux, Next.js and Node.js route handlers. First read the central index, implementation-status report and validation evidence, then the PRD, FRD, architecture, data/API contract and design system. Inspect current source and installed Next.js guidance before changing anything. Complete the earliest unmet essential task in this plan; preserve verified work and user changes. Keep new WalletProfile/AuthChallenge/WalletSession/ContributionReceipt/RateLimitBucket data separate from legacy identity/reputation tables. Protect wallet ownership, token-bound wallet attempts, signed payment references, independently verified reconciliation, exact canonical signatures and recipient-controlled publication. Never turn demo state into a live success bypass. Report changes with requirement IDs, checks actually run, unresolved blockers and next actions. Public deployment and public communications are outside this continuation unless separately authorized.
