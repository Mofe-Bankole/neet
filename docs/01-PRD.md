# Dotneet — Product Requirements Document

**Revision:** 1.1 · **Prepared:** 10 September 2026 · **Reconciled:** 11 September 2026 · **Audience:** product owner, OpenCode, Claude, reviewers.

**Status:** Target product requirements. An implementation checklist or preview is not proof that production flows work. Read the delivered implementation-status and validation documents for observed results.

## Product decision

Dotneet helps Nimiq contributors get paid and keep an attributable record of useful work. A `.neet` identity gives the record a memorable home. A builder describes a contribution, pays its contributor in NIM, and signs an acknowledgment. Dotneet checks the payment and signature independently. The contributor decides whether to publish the resulting receipt.

**Product promise:** “Get paid. Keep the proof.”

**Supporting explanation:** “A memorable name for your contribution history. Receive NIM, keep a signed acknowledgment, and choose what to share.”

The word “proof” always resolves to inspectable facts: who signed what, which payment was checked, on which network, and when. It does not mean that Dotneet guarantees competence, honesty, human identity, or the quality of the underlying work.

## Problem and reachable audience

Helpful work in small builder communities often happens in chat threads, GitHub issues, and private messages. The payment and thank-you may become difficult to find later. A newcomer has no compact way to show another builder this history, while a builder has no consistent way to pair a payment with an attributable acknowledgment.

This is a product hypothesis to test, not a claim supported by a completed pilot.

| User | Job to accomplish | Reason to return |
|---|---|---|
| Mini App builder | Pay someone for testing, translation, documentation, design feedback, or another useful contribution; acknowledge it clearly | Reward the next contribution and inspect previous acknowledgments |
| Contributor | Receive NIM and retain a record of the contribution | Publish a new receipt and share a profile with another builder |
| Prospective collaborator | Inspect what a wallet actually acknowledged and the supporting context | Revisit a contributor before working together |
| Another Mini App developer | Read a public name/profile/receipt through a narrow API | Display permitted contribution records in a real application |

Recruitment, scope agreement, and submission of work happen through existing community channels. Dotneet does not adjudicate whether work should be accepted or how much someone should pay.

## Success measures and evidence

The following are proposed pilot targets, not achieved results:

| Measure | Initial target | Evidence and counting rule |
|---|---|---|
| Complete core flow | One real-device testnet flow on each available mobile platform, plus an explicitly authorized live pilot before a production-readiness claim | Record environment, version, expected/observed result, and redacted screenshots |
| Demand | Two independent builders willing to acknowledge genuine contributions | Participant interview notes; willingness alone is not usage |
| Real use | At least five genuine contributions across more than one builder; pursue a broader community pilot only after reliability | Distinct completed contribution records; exclude demo/testnet records from live-use claims |
| Receipt usefulness | Three contributors can explain a concrete future use; observe at least one voluntary share or reuse | Consented observation or participant report, clearly labeled |
| Reliability | No unresolved critical defect in claim → pay → sign → inspect → publish | Release acceptance checklist and issue list |
| Usability | Four of five observed participants can finish the intended journey without intervention, apart from wallet setup | Small-sample observation; report sample size and failures |
| Integration | One consenting external builder can read and render a published receipt | Working consumer or documented integration test; an example alone is not adoption |

Do not count wallets as people without corroboration, incentivize circular transfers, invent partnerships, or report preview traffic as successful payments. Avoid unnecessary tracking; collect only what is needed and disclose it.

## Competition fit

The published scoring weights are functionality/reliability/usefulness 45, Nimiq integration 25, real usage 15, design/usability 10, and promotion 5. Dotneet should make its useful payment journey reliable, native, and demonstrable before expanding its feature count. [Official scoring](https://miniappscompetition.com/scoring).

The rules call for a usable Mini App, a public MIT-licensed code repository, and substantive payment/wallet integration. They encourage a demo and specify a maximum 250-word written description. Verify the submission portal and current rules before submission. No competition result is guaranteed. [Official rules](https://miniappscompetition.com/rules).

## MVP scope

### Essential

- Native Nimiq Pay provider initialization with a clear external-browser fallback.
- Signed, expiring server challenge; server-verified wallet control; secure returning session.
- One normalized `.neet` handle per wallet in this application; handle uniqueness enforced by the database.
- Public profile with name, optional description, wallet disclosure, registration date, and published verified receipts.
- Owner-only profile edits; no wallet reassignment or handle transfer in the sprint.
- Builder contribution draft: recipient, contribution statement, optional evidence URL, NIM amount, network.
- Explicit native payment authorization followed by explicit acknowledgment signing.
- Independent server checks of sender, recipient, amount, network, opaque receipt reference, successful execution and configured inclusion-confirmation policy (default 10 observed confirmations). This is not a deterministic-finality claim.
- Immutable signed acknowledgment binding the contribution and payment reference.
- Separate signature and payment states, with safe recovery after cancellation, timeouts, or reloads.
- Receipt private to participants until its recipient explicitly publishes it; public share link and unpublish control. Issuer withdrawal remains visible as marked historical evidence if previously published; active counts exclude it.
- Public, versioned read API that omits private records and exposes factual provenance.
- Responsive, accessible pages and reusable design foundations.

### Conditional after the core flow passes

- Thin TypeScript API helper and one integration example.
- Search of already public profiles.
- Additional presentation/social templates beyond the representative handoff examples.
- Richer profile imagery, if existing image handling is safe and usable.

### Excluded

Public jobs marketplace, task discovery, escrow, dispute resolution, automated quality ratings, token/referral rewards, universal reputation scores, multi-chain identity, endorsements bought for points, notifications infrastructure, follow graphs, heavy analytics, and broad integrations requiring external commitments.

## Journeys

### New contributor

Open the application → read what becomes public → connect and sign a short ownership challenge → claim an available name → see a real empty profile → share the profile with a builder. A public name is an application registry entry associated with verified wallet control, not an on-chain name-service claim or legal ownership right.

### Returning contributor

Open the app → recover an existing valid session or sign a new challenge → load the existing identity → review private incoming receipts → inspect issuer, statement, evidence, signature and payment details → explicitly publish selected receipts. Declining publication does not reverse the payment.

### Builder

Open contributor profile → authenticate the paying wallet → describe the completed contribution and enter amount → review recipient/address/network/fees → approve payment in Nimiq Pay → attach the returned transaction reference → let Dotneet independently verify the payment → request and approve the acknowledgment signature → let Dotneet verify that signature → see the private completed record. If the builder changes the active wallet, stop and reauthenticate before the next sensitive step.

### Reader / integrator

Open a shared public receipt/profile → see exactly which wallet signed which statement and the checked payment state → inspect supporting evidence → understand that publication was recipient-controlled. API consumers receive the same visibility-filtered facts; they do not receive private receipts or session identifiers.

## Product acceptance

1. The core flow completes without hidden administrative edits or mock success.
2. Nobody can claim or edit another wallet's identity by supplying its address or record ID.
3. A client-reported transaction hash does not create a confirmed-payment badge.
4. A receipt never appears public before recipient consent, including through API, profile totals, metadata, or caching.
5. Payment cancellation, acknowledgment cancellation, RPC outage, and session expiry each have a useful recovery path.
6. A retry of verification never causes a second payment automatically.
7. Legacy points/endorsements are not silently converted into verified receipts.
8. Testnet, demo, and production records are distinguishable everywhere they appear.
9. The website and app use the shared design system and are usable by keyboard and on mobile.
10. Handoffs identify exactly what was built, tested, deferred, and blocked.

## Constraints, dependencies and decisions

- One developer, eight days. Keep the existing Next.js/Node/Prisma/PostgreSQL stack and avoid a separate backend service without a demonstrated need.
- Nimiq Pay and an appropriate device are needed to validate wallet approvals. Browser previews cannot substitute for that test.
- A configured database and reliable server-side RPC connection are needed for real records and independent payment verification.
- Mainnet operation requires matching configured network, reliable verification, and explicit authorization for any real-money test action. The app never keeps users' private keys.
- A `.neet` handle database remains operated by Dotneet; receipts are hosted records backed by signed statements and chain observations.
- Deleting hosted data cannot erase public blockchain transfers, signatures already copied elsewhere, or third-party caches.
- A receipt may be collusively issued. Show the issuer and evidence rather than a general trust badge.

## Source and status discipline

Use current code for implementation facts and official Nimiq documentation for provider behavior. The original repository is an input, not evidence that any of its old roadmap checkboxes are verified. Record assumptions explicitly. Root implementation status and validation records must be synchronized before final handoff.
