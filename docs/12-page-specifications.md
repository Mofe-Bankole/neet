# Dotneet page inventory and interaction specifications

Status: implementation contract. Final shipped status belongs in the final package's implementation inventory and validation log. Do not infer integration completeness from polished screenshots.

## Route overview

| Route | Audience and purpose | Primary action | Required states |
|---|---|---|---|
| `/` | New contributor or builder; understand the value and limits | Open app | Ready; clearly labeled sample receipt; working navigation |
| `/app` | Contributor onboarding or returning owner | Verify wallet control / open existing profile | Wallet unavailable, disconnected, access pending, challenge pending, verified, handle available/taken, existing profile, error |
| `/[handle]` | Any viewer inspecting a public contributor profile | Acknowledge a contribution | Loading, public profile, no receipts, not found, temporary failure |
| `/acknowledge?to=[handle]` | Builder preparing payment and signed acknowledgment | Review acknowledgment, then explicit wallet approvals | Draft, validation error, review, wallet unavailable, cancelled, pending, partially complete, complete, failed/unknown |
| `/receipts/[id]` | Owner or public viewer inspecting one receipt | Inspect evidence / share if public | Private owner view, public view, unpublished unavailable, pending facts, invalid reference, not found |
| `/design-system` | Developer/designer consuming reusable foundations | Inspect tokens, components and templates | Gallery navigation, interactive samples, explanatory status |
| `/preview` | User or reviewer exploring fixtures without a wallet | Explore sample flow | Persistent demo labeling; no real wallet, payment or verified-record mutation |

### `/` — Landing

Headline: “Get paid. Keep the proof.” Lead: “Your useful work deserves more than a thank-you lost in a chat. Get paid in NIM and keep an acknowledgment under your own .neet name.” Primary action: “Make a name for your work.” Secondary action: “Explore a sample.”

Order: navigation → value proposition plus one sample receipt → three independent facts → three-step explanation → contributor/builder use cases → small integration invitation if a real API exists → closing action → footer attribution and links.

Sample receipt copy: “Mobile testing that made the next release better.”; issuer “mika.neet”; recipient “ada.neet”; explanatory visible label “ILLUSTRATIVE SAMPLE.” Sample amount is illustrative, not a usage or earnings claim. No invented user count, logos or testimonials.

Mobile: text before receipt, prominent CTA without filling the entire first screen, no decorative overflow. Accessibility: single h1, meaningful navigation labels, skip link, sample card reading order.

### `/app` — Onboarding and returning-user entry

Purpose: bind a name to demonstrated wallet control and let an existing owner return. Do not use a locally stored wallet address as authentication.

Order: brief explanation → environment availability → request wallet access → show selected wallet → explain sign-in challenge → sign and verify → look up existing identity → offer claim only when absent → availability check → server-confirmed claim → profile action.

Copy: “A name starts with your wallet.” Challenge helper: “Sign a short message to prove control of this wallet. This step does not send a payment.” This must accurately describe the actual challenge integration.

A browser outside Nimiq Pay offers instructions or a clearly labeled preview, not a dead disabled button without context. Claim fields explain the suffix and normalization rules, with an explicit availability check. A server conflict preserves the typed handle. Returning users see “Open your profile,” not a second registration requirement.

### `/[handle]` — Public profile

Order: handle and display name → bio → wallet control fact → claim date → contribution records → primary acknowledgment action → optional explanation of verification limits. On mobile, keep recipient identity and action above the ledger.

Show count of public receipts only if calculated from actual eligible records. No “reputation,” “trust percentage,” “verified person,” or points tied to payment amounts. Explain that a handle identifies the wallet/profile in this app and does not guarantee a real-world identity.

A receipt row shows contribution statement/title, issuer, date, amount with NIM unit, and separate signature/payment statuses. Sort consistently; do not mix unpublished items into a public count. Owners may see private controls in a separately authorized section.

### `/acknowledge?to=[handle]` — Contribution, approval and recovery

Use query values only as lookup inputs, never trusted recipient addresses. Resolve the handle on the server and show the recipient wallet before approval.

Fields: contribution title/statement, optional evidence URL, NIM amount and a visible recipient summary. Keep “Review acknowledgment” distinct from the subsequent payment/signing actions. Document min/max input lengths and payment precision in the FRD; the UI references those rules rather than inventing separate limits.

Review: exact recipient, amount, network, contribution statement and evidence URL. Explain wallet approvals and publication controls before action. Allow edits before irreversible approval. Changes after signing require a new acknowledgment, not mutation of signed text.

Payment and signature have independent states. A sent transaction with unknown confirmation does not create a new pay action. Recovery first checks the existing reference. Confirmed payment plus missing signature offers “Finish acknowledgment.” Cancellation must not be labeled failure unless that is the actual outcome. A duplicate event should return the existing receipt, not issue another.

### `/receipts/[id]` — Inspection and sharing

Order: publication/data-mode label → contribution statement → contributor and issuer → amount/network/date → distinct payment/signature fact rows → evidence → deeper technical details → sharing/action area → concise verification limits.

The exact signed statement and signer wallet must be available for inspection. Wallet addresses/hashes may be shortened visually with access to full values and an accurate copy control. Transaction links must target the correct network. Do not invent a clickable transaction link for a fixture hash.

Default publication is private until the contributor deliberately chooses to publish the specified fields. Public reads enforce visibility on the server. Share controls for private receipts explain that public access is unavailable; a preview must not leak private fields via metadata. Publication does not make a blockchain payment private or erase existing external copies.

### `/design-system` and `/preview`

The gallery is a browsable reference, not a paid feature. It shows semantic swatches, typography, buttons and fields, fact status meanings, receipt examples, and browser versions of the seven slide/social templates. Every illustrative record remains labeled.

`/preview` explicitly states no real funds or verified records are created. Preview state must not enable production authentication bypass or be accepted by live verification endpoints. If illustrative interactions update local state, document their scope and persistence honestly.

## Shared states and acceptance

Loading: preserve structure with restrained placeholders; do not render fake positive status. Empty: explain the next legitimate step. Error: distinguish invalid input, network outage, not found and unauthorized. Retry: only repeat safe requests and look up existing transaction state before money-related action. Success: show what completed and what remains.

At 390 px width, no page-level horizontal scroll, clipped primary action, overlapping handle, or unreadable receipt facts. At 1440 px width, keep forms narrow and avoid stretching one line of text across the entire viewport. Keyboard users must reach the main action, open/close menus, submit forms, inspect details and copy/share without a pointer. Record actual evidence in the validation log rather than marking these checks complete in this specification.

## Delivered page status and file map

| Route | Main implementation | Status |
|---|---|---|
| `/` | src/app/page.tsx; system.tsx | Functional landing and navigation; clearly labeled illustrative receipt |
| `/app` | WalletDashboard.tsx; useSession.ts; forms.tsx | Connected onboarding, claim, edit, receipt list and returning-session UI; native wallet testing pending |
| `/[handle]` | PublicProfile.tsx; ReceiptCard.tsx | Connected public profile, count scope, receipt list, share and error/empty states |
| `/acknowledge` | AcknowledgeForm.tsx | Connected draft form and review navigation; real native payment approval pending |
| `/receipts/[id]` | ReceiptView.tsx | Connected private/public inspection, attempt recovery, confirmation, signing, publication, withdrawal and JSON download; native end-to-end validation pending |
| `/preview` | Preview.tsx; SampleReceipt | Browser-only fictional demonstration; no wallet/payment API calls |
| `/design-system` | src/app/design-system/page.tsx | Browsable shared components, tokens and cross-format export links |
| `/api` | src/app/api/page.tsx; examples/read-profile.ts | Public integration reference and minimal example |

Shared component paths are under src/components unless otherwise stated. UI implementation is not a claim that the native-device journey was exercised. See VALIDATION.md for actual checks and screenshots/README.md for captured states. Protected authenticated screens were checked through HTTP contracts; sample screenshots must not be relabeled as real payment evidence.
