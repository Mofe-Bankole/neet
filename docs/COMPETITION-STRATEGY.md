# Dotneet competition strategy

Dotneet’s strongest direction for Cycle II is a portable record of paid contributions: a Nimiq builder pays someone for useful help, signs an acknowledgment, and the recipient keeps an inspectable receipt under a memorable `.neet` name. The proposed positioning is **“Get paid. Keep the proof.”**

This recommendation assumes eight days of development by one person, with access to the Nimiq community and other Mini App builders. It preserves the existing identity and payment foundation. It concentrates new work on one complete experience: **pay a contributor, acknowledge what they did, and give them a record they can use again.** Matching people with work can happen through existing community channels during this cycle.

This is a strategic recommendation, not a prediction of a prize. Its commercial premise still needs validation: builders must actually want to pay contributors and issue these records, and contributors must find the records useful enough to share or reuse.

## 1. The findings that change the original idea

**Naming and an SDK are already present in the competitive landscape.** NimConnect entered Cycle I with readable handles, public profiles, social payments and reusable identity tooling. Therefore, “Nimiq has no naming solution” should be removed from the pitch. Its existence does not prove Dotneet cannot succeed; it means Dotneet needs a more specific improvement than aliases plus an API. [^5]

NimConnect’s creator later reported judging feedback about onboarding, error handling, excessive breadth and limited value for people beyond existing address holders. That is the creator’s account, rather than a published judge transcript. Nevertheless, it is an unusually relevant warning against expanding Dotneet into an identity/social/payment platform with many unfinished features. [^6]

**The current reputation promise needs stronger foundations.** In the reviewed public source, claiming a handle does not require a verified wallet signature, some profile mutations lack ownership checks, and endorsements award points from client-supplied payment details without independent chain verification. The current score is an accumulation of application events, not a calibrated measure of trust. These findings are from source review; they are not evidence of a live exploit. [^23][^24][^25][^26]

**The best opportunity is a human outcome.** A contributor wants to be paid and remembered for useful work. A builder wants useful testing, translation, documentation or feedback and a straightforward way to acknowledge it. A `.neet` identity becomes valuable when it carries that relationship and its evidence.

## 2. What Cycle II actually scores

The current rubric allocates 100 points as follows. The third column is a proposed Dotneet response, not an official guarantee of points. [^1]

| Category | Maximum | Evidence Dotneet should present |
|---|---:|---|
| Functionality, reliability and usefulness | 45 | One complete contribution-payment-receipt flow; clear audience; working reloads and links; useful repeat behavior |
| Nimiq Pay and ecosystem integration | 25 | Native wallet authorization, payment and message signing central to the experience; honest pending/cancelled/failed states |
| Real usage | 15 | Genuine participants completing core actions, with an understandable counting method |
| Design and usability | 10 | Mobile interface; purpose apparent immediately; first useful action reachable without coaching |
| Builder promotion | 5 | Public post about the app and competition; an app post in Skool |

The published usage bands are **25+ users: 15 points; 11–24: 10; 4–10: 6; 0–3: 0**. The promotion checklist gives three points for a public app-and-competition shoutout and two for a Skool app post. The usability rubric asks whether a first-time user reaches the point within 60 seconds unaided. The site does not establish that one wallet equals one unique person. [^1]

**Allocation decision:** protect the 70 points tied to functionality and integration before expanding the SDK or making promotional content. A video helps judges understand evidence; it cannot repair a broken live experience.

Cycle II closes **September 18, 2026 at 23:59 UTC**, or **September 19 at 00:59 in Africa/Lagos**. Submit with a buffer. A public MIT-licensed repository, a functioning Mini App, meaningful supported wallet integration and a description of at most 250 words are material requirements. A demo video is encouraged, not mandatory. [^2][^3]

## 3. Nimiq’s institutional fit and the human story

Nimiq describes itself as a nonprofit, open-source payment project and emphasizes self-custody, accessibility and collaboration. Its short “Crypto for humans” framing is particularly relevant. Dotneet should make a human interaction easier while leaving users in control of payment authorization. [^7]

The 2026 outlook presents Mini Apps as a way for community builders to experiment, attract people from other ecosystems and discover useful functionality that could eventually merit native support. A future integration into Nimiq Pay is a possibility to earn through adoption, not something to assume in this submission. [^8]

The following emotional responses are design hypotheses based on those published priorities. They are not claims about the private preferences of individual judges.

| Audience or institutional interest | Human motivation | Product decision | Evidence to collect |
|---|---|---|---|
| Contributor | “My help should count after this chat ends.” | A shareable, inspectable contribution receipt | Actual recipients voluntarily sharing their records |
| Builder | “I need useful help and a clear way to reward it.” | Pay and acknowledge from one focused screen | Builders returning to pay a second contributor |
| Newcomer | “I would rather earn my first NIM than buy it just to participate.” | Free claiming and a readable public entry point | A real first-time user completing onboarding and receiving payment |
| Nimiq community | “People building here should help one another.” | Contribution records useful across projects | Cross-project contributions or a real external display integration |
| Council evaluating the entry | “Can this builder maintain what they are promising?” | Narrow scope, visible error handling, traceable evidence | Working product, honest limitations, practical maintenance plan |

### Origin and local relevance

Nimiq has documented roots in Costa Rica and has supported adoption efforts in Europe, Latin America and The Gambia. These sources support a global, community-led payments story; they do not justify assumptions about judges’ national psychology. [^9][^10]

For this sprint, the relevant community is the one that can actually participate: Nimiq builders and their contributors. Do not add an untested merchant, campus or remittance story merely to sound locally important. A small, documented community pilot is more credible than a broad geographic claim.

A relevant June 2026 Nimiq forum discussion rejected a proposed Nigeria adoption program in its then-current form, questioning duplication, measurable outcomes, incentive abuse and sustainability. This was a funding discussion, not the competition rubric. It nevertheless reinforces the importance of showing what Dotneet adds beyond existing payment tools and how the pilot will produce meaningful usage. [^11]

Later expansion could serve translators, community educators and local onboarding contributors. That is a plausible extension of the same receipt model. Merchant discovery, fiat conversion and regional operations are separate products and should stay outside this submission.

## 4. What to learn from winners and competitors

The official Cycle I announcement confirms Nimiq Space, NimJump and NimQuest as the winners. Its descriptions emphasize shared activity, enforced verification and useful wallet-backed interactions. Individual numerical judge scorecards are not published there. The lessons below are interpretation, not proven explanations of the awards. [^3]

| Winner | Relevant observed strength | Dotneet lesson |
|---|---|---|
| Nimiq Space | Wallet-linked participation in a persistent shared world | Give identity an immediate social consequence people can see and revisit |
| NimJump | Server-side replay checks for runs | Make verification an enforced mechanism |
| NimQuest | Server grading followed by a time-limited wallet signature; no payment required | A small, authentic proof flow can demonstrate meaningful wallet integration |

The useful common pattern is **an understandable activity followed by a credible result**. Dotneet’s equivalent is a real contribution followed by payment evidence and an attributable acknowledgment. Do not copy game mechanics solely because two winning products were games.

The reported observation that winners attached short X videos is a reasonable presentation cue. It does not establish that all three used a particular length, or that video caused their wins. The recommended two-minute demonstration below is a strategy choice.

### Competitive positioning

| Product | Relevant overlap | What Dotneet should learn |
|---|---|---|
| NimConnect | Handles, profiles, social payments, identity client | A name and an API need a specific recurring use case [^5] |
| SNS | Pseudonymous identity and a foundation for reputation | “SNS with reputation” is not a sufficient product distinction [^12] |
| ENS | Name resolution and profile records | Alias, avatar and biography are useful basics [^13] |
| Basenames | Builder identity, skills and participation | Show what a person has contributed, with its source [^14] |
| NimBooks and Cryptopayment.link | Payment requests, receipts and payment links in the Nimiq ecosystem | Generic proof of payment is also not enough; focus on contribution context and portability [^16] |
| Human Passport | Purpose-specific models and threshold tradeoffs | A score needs a defined question, calibration and an honest insufficient-data state [^18] |
| Ethereum Attestation Service | Structured, attributable statements and revocation | Borrow the distinction between a statement, its issuer and its verification status [^17] |

A relevant external precedent is **Clarity**, an ETHGlobal Singapore 2024 finalist that won Sign Protocol’s Best Overall and Best Consumer Application prizes. Its showcase combines merchant naming, payments, payment-linked reviews and an integration SDK. The transferable lesson is to make identity infrastructure understandable through a concrete transaction. This is inspiration, not proof that its formula will win Nimiq’s competition. [^15]

Dotneet’s proposed distinction is:

> A Nimiq contributor can carry a record of paid, acknowledged help from one builder relationship into the next.

This is narrower and more testable than claiming to measure whether every wallet is trustworthy. It is also only a differentiation hypothesis until contributors actually reuse the record.

## 5. Three directions, ranked for this sprint

These are qualitative strategic judgments for a solo builder with eight days. They are not estimated win probabilities.

| Direction | Core experience | Strength | Constraint | Recommendation |
|---|---|---|---|---|
| **Dotneet contribution receipts** | Pay a contributor, acknowledge their help, keep the record | Human benefit, real NIM use, repeat relationships, existing audience | Must secure and verify both payment and acknowledgment | **Build this** |
| **Dotneet cross-app passport** | Carry verified app achievements under one name | Strong ecosystem integration story | Depends on credible issuers and partner participation; empty-profile problem | Add one small integration only after core works |
| **Dotneet supporter cards** | Tip a builder and leave a signed thank-you | Small feature surface and easy sharing | Overlap with social payment tools; money does not establish competence | Fallback if contribution demand is weak |

A local merchant trust card is an eventual application, but it introduces customer acquisition, review disputes and proof-of-purchase questions that the current eight-day audience cannot resolve. A bounty marketplace adds matching, deadlines, submissions, adjudication and nonpayment cases. Neither belongs in this version.

Keep the Dotneet name. Use “Get paid. Keep the proof.” as the product promise. A short handle remains the identity anchor; the receipt becomes the reason to care about it.

## 6. The smallest complete product

### One concrete example

A community member tests a Mini App and sends its builder a reproducible mobile bug report through the community’s existing channel. The builder finds the contributor’s `.neet` profile, enters an agreed NIM amount, adds “Reported the Android keyboard issue” and links the public issue. Nimiq Pay handles the authorized payment and signature. Dotneet verifies the payment and the signed statement separately.

The contributor can publish the resulting receipt on their profile and share it when offering help to another builder. The next builder can inspect the original acknowledgment and transaction. Dotneet has preserved evidence of a relationship; the next builder still decides what to make of it.

The example amount should be agreed by participants for real work. There is no recommended token purchase, and no need for a registration payment.

### Four screens

| Screen | What it must do | Primary action |
|---|---|---|
| Public profile | Explain whose profile this is and display approved contribution records | Open in Nimiq Pay / acknowledge a contribution |
| Wallet-bound claim or sign-in | Establish control and recover an existing profile on return | Claim name / continue |
| Pay and acknowledge | Show recipient, amount, contribution statement, evidence URL and what wallet prompts will request | Review and continue |
| Receipt | Separate signed acknowledgment from payment status; provide evidence and sharing controls | Inspect / publish / share |

Offer public read access before asking for a wallet connection. Explain the wallet step at the point it is needed. Registration date is secondary information, not the hero. Existing users should return to their profile instead of facing the claim screen again.

### The moment to demonstrate

The receipt appears under the contributor’s name and can be inspected or displayed elsewhere. The satisfying moment is **recognition becoming a reusable record**, not a number increasing.

An illustrative receipt might show:

| Field | Example display |
|---|---|
| Recipient | `ada.neet` |
| Contribution | Mobile testing: Android keyboard issue |
| Acknowledged by | `builder.neet` — signing wallet available |
| Signed statement | Signature verified |
| Associated payment | Confirmed on Nimiq; transaction link |
| Evidence | Link to the public issue |
| Date and status | Issued date; active or withdrawn acknowledgment |

Names and examples here are fictional. No participant, partnership or completed contribution is implied.

### What “verified” means

Use separate labels for separate claims:

- **Wallet control verified:** a valid challenge signature was checked against this wallet.
- **Acknowledgment signed:** the identified wallet signed the displayed statement.
- **Payment confirmed:** a matching transaction was independently observed on the selected network.
- **Contribution quality:** stated by the issuer; not independently certified by Dotneet.

Do not label someone a verified human, safe counterparty or endorsed developer because their wallet signed a message. A successful payment does not prove that work was good. Two distinct wallets do not prove two distinct people.

For summary statistics, use receipt count, distinct issuer wallets, last acknowledged contribution and inspectable sources. Give newcomers “No contribution receipts yet.” Avoid global rankings, purchasable trust, wallet-balance weighting, or penalties for being new.

Public sharing should be an informed recipient choice. Explain that public payment records remain public even if a profile receipt is hidden. Keep sensitive feedback outside on-chain text and do not expose a person’s complete payment history merely to show one contribution.

## 7. Current product audit and priorities

The source review covered main commit `6677889fcbb782eef22223d8172bbc7584dda3ea` and the SDK branch at `0d2616899ff3c433031312b3d671bc9af7dcf2af`. The deployed Vercel commit was not established. No state-changing live testing was performed.

The useful foundation includes the Next.js application, database-backed handle registry, profile rendering, event storage, read/search routes and Nimiq payment helper. The registry is currently stored in the application database, rather than being an on-chain naming system. [^23]

| Priority | Observed issue | Required response |
|---|---|---|
| Immediate | Claim route accepts an address without a verified signature [^24] | Require a server challenge and verify control before linking a handle |
| Immediate | Profile and post mutations accept identity IDs without ownership checks [^25] | Authenticate retained writes; disable unused routes |
| Immediate | Endorsement route trusts supplied payment details [^26] | Replace scoring with independently checked payments and attributable statements |
| Immediate | “Verified Wallet” appears for claimed profiles without the above proof [^27] | Show verification only after the check actually exists |
| High | Several dashboard actions are inert; returning-user lookup is absent [^28] | Complete profile recovery, required edits and sharing; remove unused actions |
| High | Supplied memo is discarded by the payment helper [^29] | Explicitly implement any payment-reference binding used by receipts |
| Medium | Identity API omits wallet address; amount summary covers only recent endorsements [^30] | Correct fields and aggregation before claiming a finished integration contract |
| Stretch | SDK exists on a separate branch; cross-origin use needs validation [^31] | Reuse selectively after core functionality works |

On September 10, the landing page loaded but its opening button was disabled outside Nimiq Pay, some descriptions displayed literal markup, and two public read checks—search and the linked API page—returned HTTP 500 at approximately 14:53 UTC. These observations do not diagnose the cause or establish a continuous outage. Restore and recheck those paths before directing judges or users there. [^32]

Avoid rewriting the entire application. Repair the retained flow, remove misleading UI, and redirect effort from general social features into receipts. Existing unverifiable endorsements should not be silently relabeled as verified contribution evidence.

## 8. Implementation boundaries and the API

The official Mini App provider supports message signing and native NIM payments, including a transaction-with-data variant. It returns a public key and signature for signing and a transaction hash for payment. A hash returned by the wallet is not, by itself, independent confirmation that the expected payment settled. Nimiq’s RPC documentation provides transaction lookup for backend checks. [^19][^20][^21]

The architecture can remain small: Dotneet stores profiles and signed receipt records; Nimiq Pay holds keys and asks for approvals; the backend checks signatures and chain data. Open-source application code and exportable signed receipts improve inspectability, but a hosted registry remains a hosted registry. Do not describe the entire application as decentralized merely because it uses blockchain payments.

### Minimum security and state model

Use a server-issued, single-use challenge with expiry and origin context for wallet ownership. Verify the actual provider message format and that the signing public key derives the claimed wallet address. Do not invent a signature format or treat a returned signature as already validated.

Bind an immutable acknowledgment to its issuer, recipient, statement, evidence URL, network and payment reference. A practical sequence is payment first, then signature over a statement containing its transaction hash. Preserve the payment result if the user cancels the signature. The retry should resume acknowledgment signing without sending a second payment.

Before marking a receipt complete, independently verify the transaction’s network, sender, recipient, amount and successful inclusion under the documented confirmation policy. Enforce transaction/reference uniqueness atomically in storage. A failed or unavailable lookup should leave an honest pending state.

Represent at least: draft, awaiting authorization, payment submitted, payment confirmed, acknowledgment awaiting signature, complete, cancelled and failed. A cancellation of the statement must not imply that an already completed payment was reversed. An issuer withdrawal can update the acknowledgment’s current status while preserving the historical transaction fact.

Reject direct self-receipts and flag obvious repeated-pair patterns, but acknowledge that colluding wallets can still manufacture records. The narrow product claim is that evidence is attributable and inspectable. It is not Sybil-proof reputation.

Nimiq’s optional device identifier is scoped to an app origin and identifies a device, not a person. It may assist disclosed abuse controls; it cannot establish unique human identity or a universal cross-app identifier. It is unnecessary for the initial receipt product unless a specific need emerges. [^22]

### Keep the SDK thin

Prioritize a small documented read contract over a broad SDK release:

| Resource | Useful information |
|---|---|
| Profile | Canonical handle, current wallet binding, registration date, verification status |
| Contribution receipts | Statement, issuer and recipient, evidence URL, payment reference, signature status, current acknowledgment status |
| Summary | Receipt count, distinct issuer wallets, latest receipt date, provenance |

An API version and explicit network field reduce ambiguity. Keep `reputationScore` out of the new public promise; if compatibility requires retaining it, label its old experimental meaning rather than silently changing it into a trust metric.

Prove one cross-origin read in a real integration or a clearly labeled example before claiming that other Mini Apps can consume it. Account for permitted origins, credentials and failure states. Do not ask Nimiq to modify core code as a prerequisite for this entry.

The ideal partner experiment is small: another willing builder displays a `.neet` name and an inspectable contribution record beside an existing contributor entry. If no external builder integrates before the deadline, ship the standalone product and label the example widget as a demonstration. Never describe planned collaboration as completed adoption.

## 9. Eight-day execution plan

Treat these as work blocks starting now. The final two days should protect the submission, not introduce a new product. Run recruitment alongside development from the first day.

| Day | Engineering deliverable | Validation or distribution task |
|---|---|---|
| 1 | Restore public reads; remove dead actions and unsupported verification claims; freeze scope | Speak to five reachable builders about help they already need |
| 2 | Secure handle ownership and retained writes; recover profile after reload | Secure two independent builders willing to pay for actual contributions |
| 3 | Native payment plus signed acknowledgment and backend verification | Observe the first complete participant flow on a phone |
| 4 | Receipt rendering, safe retries, publication choice, sharing | Run a small live pilot and observe failure/cancellation paths |
| 5 | Fix the most common onboarding friction; add a thin read interface if ready | Expand invitations through builders already participating |
| 6 | Feature freeze; validate integration or labeled example | Measure genuine core use, return use and participant feedback |
| 7 | Final mobile checks, repository instructions, submission evidence and video | Submit with a buffer; publish app/competition and Skool posts |
| 8 | Correct submission or production blockers only | Recheck the submitted links and respond to testers |

**Gate at Day 2:** ownership checks and live reads must work. If they do not, pause added receipt features until the foundation is repaired.

**Gate at Day 4:** a real phone must complete payment and signed acknowledgment, and cancellation/retry must behave correctly. If this slips, cut the external integration and all task-management features. Do not cut verification to preserve scope.

**Demand gate within 48 hours:** at least two independent builders should commit to using their intended contribution budgets for actual work, and at least three contributors should see a specific reuse for the record. These are proposed validation thresholds, not competition rules. A concierge pilot can test demand before the product is complete; it must not be reported as completed app usage.

If builders want to pay but contributors do not care about keeping or reusing the evidence, narrow the product promise to contributor payment and acknowledgment. If builders will participate only because the founder funds circular transfers, the main demand hypothesis has failed. Do not manufacture a success story.

## 10. A credible usage and evidence plan

The operational goal is to exceed the published 25-user band with a small buffer, while ensuring participants actually use the product. A target of approximately 30 real people is a planning choice, not a promise or a reason to count low-quality activity.

Start with two or three builders who have specific testing, documentation, translation or design-feedback needs. Ask each to recruit a handful of contributors they actually want help from. Expand through successful participants. This gives the product a purpose beyond registering an alias for the competition.

The outreach offer is concrete: a builder can pay and acknowledge useful help, and the recipient can keep the record. Avoid asking people to register solely to improve the entry’s numbers. Avoid payments for positive reviews, endorsements of the product or favorable public posts.

### What to measure

| Measure | Why it matters | Reporting rule |
|---|---|---|
| Genuine core participants | Product use beyond visits | Explain which actions qualify and how people were deduplicated |
| Completed payment-and-acknowledgment pairs | The central promise worked | Count only verified, complete records |
| Distinct paying builders | Buyer demand | Separate the founder’s spending from independent spending |
| Returning participants | A reason to reopen | Define the later date/session and core action |
| Receipts voluntarily shared or reused | Portability is useful | Use observed shares/reuse rather than inferred impressions |
| Onboarding completion and friction | Whether first use is understandable | Observe actual phones; record where coaching was needed |
| Errors and cancelled flows | Reliability | Document fixes and whether payment state remained accurate |
| First-time Nimiq users | Acquisition beyond existing users | Establish this with participants; a new wallet alone is insufficient |

Maintain separate counts for team testing, testnet activity, compensated pilot participation and organic usage. Paying someone for useful testing is genuine economic activity, but disclose that context. A paid pilot does not establish sustainable demand after the pilot ends.

Prepare a compact evidence folder for the submission: aggregate usage method and results, permissioned participant quotes, inspectable example receipts, an integration screenshot if real, and a short note about the most important user-driven fixes. Do not publish private participant information or sensitive feedback to prove usage.

The product should remain useful after rewards end because independent builders need help and contributors want records. That is the sustainability hypothesis to test. Do not add token emissions, referral point farming or a reward treasury to substitute for it.

## 11. The two-minute demo

Record the actual product inside Nimiq Pay. Use captions, readable mobile screens and clear narration. If a network wait is shortened in editing, label the cut rather than presenting it as instantaneous completion. All participants, transactions and integrations shown as real must be real and permissioned.

| Time | What appears | What the story establishes |
|---|---|---|
| 0–12 seconds | A real example of useful help and its contributor | The human problem: recognition disappears into chat history |
| 12–28 seconds | The contributor’s `.neet` profile | A memorable identity with a practical purpose |
| 28–58 seconds | Builder reviews contribution, recipient and amount; native wallet prompts | Nimiq Pay is essential and the user stays in control |
| 58–85 seconds | Completed receipt, with acknowledgment and payment evidence opened | “Verified” has a precise, inspectable meaning |
| 85–105 seconds | Recipient shares the record; optional real integration | Why the contribution record can matter again |
| 105–120 seconds | Actual pilot results, working link and concise closing line | Execution and evidence support the promise |

Suggested opening: “A useful contribution should not disappear when the chat scrolls away. Dotneet lets Nimiq builders pay the people who help them, and gives those contributors a record they can keep.”

Suggested closing: “A name people remember. A contribution they can inspect. Dotneet: get paid, keep the proof.”

Do not spend the opening explaining naming protocols, wallet-address length, scoring formulas or API fields. Show the user’s problem, then the product’s answer.

## 12. Submission and launch copy

The following is **proposed copy for the completed scope**. Use it only after the described behavior works; remove any claim that remains unimplemented. Add actual pilot figures only after measuring them.

### Submission description

Dotneet helps Nimiq builders pay people for useful contributions and gives contributors a record they can keep.

A tester, translator or community contributor claims a memorable `.neet` profile. After receiving useful help, a builder sends NIM through Nimiq Pay and signs an acknowledgment describing the contribution, with an optional evidence link.

Dotneet checks the wallet signature and associated payment separately. The contributor can publish a receipt showing who acknowledged the work, what they said and which payment was confirmed. Others can inspect the original evidence.

The first audience is the Nimiq Mini App community: builders who need help and contributors who want their work to remain visible after a conversation ends.

Dotneet presents specific, attributable records. It does not claim that a wallet signature proves someone’s identity or that receiving money makes someone trustworthy.

Nimiq Pay provides native payment and signing approvals while users retain control of their funds. The app is open source and works as a focused contribution-payment experience inside Nimiq Pay.

### Public post

Useful work should leave more than a message in a chat.

I’m building Dotneet for Nimiq Mini Apps Competition Cycle II: pay someone for helping your Mini App, sign an acknowledgment, and let them keep the receipt under their `.neet` name.

The demo shows the full flow inside Nimiq Pay.

Try it: [insert working app link]
Source: [insert repository link]

### Skool post

Dotneet is ready for a focused test with Mini App builders and contributors.

If someone helped test, translate, document or improve your app, Dotneet lets you pay them in NIM and sign an acknowledgment they can keep on their `.neet` profile.

I’d like feedback on three things: whether the first-use flow is clear, whether the receipt says exactly what you expect, and whether you would use it again for another contribution.

[Insert working app link and demo. Include measured pilot findings if available.]

These drafts are not messages sent to anyone. Replace placeholders and validate the claims before publishing.

## 13. Questions the judges are likely to ask

**Why isn’t this just a payment note or a tip jar?** The intended difference is that a contributor can assemble an inspectable record across relationships and use it elsewhere. If pilot participants never reuse it, the distinction remains weak. Show reuse rather than claiming it.

**Why doesn’t an ordinary portfolio solve this?** An ordinary portfolio can contain useful evidence. Dotneet adds an attributable acknowledgment from the paying wallet and independently checked payment information. The advantage should be demonstrated in the existing Nimiq workflow, not claimed for every profession.

**Can people manufacture good-looking profiles?** Yes, colluding wallets can create misleading histories. Dotneet should expose sources, separate distinct wallets from people, avoid a universal trust score and make no guarantee of work quality. The product improves evidence inspection; it does not eliminate fraud.

**Who pays, and why?** Builders pay for contributions they actually need. The strongest evidence is independent builders using their own intended budgets and returning to the product. Founder-funded pilot rewards should be disclosed separately.

**Where is the developer ecosystem benefit?** Start with useful contributor records. A small, functioning external display integration is additional evidence; a speculative SDK roadmap is not adoption.

**How does a newcomer benefit?** The intended pathway is to contribute and earn NIM without buying tokens to claim a name. This still requires a functioning wallet onboarding path and real newcomer testing. Do not equate fresh addresses with newly acquired people.

**Will the app survive the competition?** Keep operating costs and features small. The prize is paid in three installments subject to continuing operation and maintenance conditions; the payout page also requires a meaningful later update and status summary. A manageable product is part of a credible prize strategy. [^4]

The immediate success criterion is a reliable, understandable product used for real contributions. The larger opportunity—a portable Nimiq contribution identity—becomes more convincing as people reuse those records across projects.

## Sources

Unless otherwise stated, official undated pages and public source files were consulted on September 10, 2026. Numbered references distinguish published facts from the recommendations in the report.

[^1]: Nimiq Mini Apps Competition. [Scoring Guide](https://miniappscompetition.com/scoring). Current Cycle II rubric; expanded usage and promotion categories.
[^2]: Nimiq Mini Apps Competition. [Rules](https://miniappscompetition.com/rules). Eligibility, integration, public MIT source, description length and video guidance.
[^3]: Team Nimiq. [Mini Apps Competition: Cycle #1 Winner Announcement!](https://www.nimiq.com/blog/mini-apps-competition-cycle-1-winner-announcement/), August 14, 2026. Winner descriptions and Cycle II deadline. Its reference to four Cycle I categories differs from the five categories in the current rubric.
[^4]: Nimiq Mini Apps Competition. [Payout System](https://miniappscompetition.com/payout). Three installments and continuing maintenance conditions.
[^5]: Nimiq Mini Apps Competition. [NimConnect submission](https://miniappscompetition.com/submissions/cycle1/maestroi). Submitted product capabilities; see also [NimConnect source](https://github.com/NimMiniApps/NimConnect).
[^6]: NimConnect creator. [Retiring NimConnect](https://www.skool.com/miniappscompetition/retiring-nimconnect?p=6430282c). Firsthand account of received feedback, not a published judge scorecard.
[^7]: Team Nimiq. [About Nimiq](https://www.nimiq.com/about/). Mission and organizational framing.
[^8]: Team Nimiq. [Nimiq 2026 Outlook](https://www.nimiq.com/blog/nimiq-2026-outlook/), January 2026. Mini App experimentation and potential future native adoption.
[^9]: Team Nimiq. [Nimiq and Coinpay join forces to increase Crypto adoption](https://www.nimiq.com/blog/nimiq-collaborating-with-coinpay/), January 9, 2023. Historical Costa Rican ties; not evidence that every described future integration is currently available.
[^10]: Team Nimiq. [Nimiq Transparency Report 2025](https://www.nimiq.com/blog/nimiq-transparency-report-2025/), August 25, 2025. Documented regional adoption support.
[^11]: Nimiq Forum. [Nimiq Adoption Network Proposal](https://forum.nimiq.community/t/nimiq-adoption-network-proposal/2513), June 8–25, 2026. Proposal and funding discussion, especially replies dated June 23 and 25.
[^12]: SNS. [SNS overview](https://docs.sns.id/collection). Naming, pseudonymous identity and reputation framing.
[^13]: ENS. [ENS documentation](https://docs.ens.domains/). Names, address resolution and profile records.
[^14]: Base. [Build your onchain identity with Basenames](https://blog.base.org/build-your-onchain-identity-with-basenames), 2024. Builder identity and participation framing.
[^15]: ETHGlobal. [Clarity](https://ethglobal.com/showcase/clarity-c2us8), Singapore 2024 showcase. Verified award labels and participant-described product.
[^16]: Nimiq. [Awesome Nimiq](https://github.com/nimiq/awesome). Ecosystem listing including NimBooks and payment tools.
[^17]: Ethereum Attestation Service. [Core concepts](https://docs.attest.org/docs/zk--playbook/core-concepts) and [Revoking attestations](https://docs.attest.org/docs/tutorials/revoking-attestations). Attribution and revocation concepts.
[^18]: Human Passport. [Scoring thresholds](https://docs.passport.human.tech/building-with-passport/stamps/major-concepts/scoring-thresholds) and [Available models](https://docs.passport.human.tech/building-with-passport/models/available-models). Model scope and threshold tradeoffs.
[^19]: Nimiq Developer Center. [Mini Apps overview](https://nimiq.dev/mini-apps). Embedded wallet architecture, consent and sharing links.
[^20]: Nimiq Developer Center. [Nimiq Provider API](https://nimiq.dev/mini-apps/api-reference/nimiq-provider). Signing and native transaction methods.
[^21]: Nimiq Developer Center. [Get transaction by hash](https://nimiq.dev/rpc/methods/get-transaction-by-hash) and [RPC client overview](https://nimiq.dev/rpc/). Backend transaction access.
[^22]: Nimiq Developer Center. [Device Identifier in Mini Apps](https://nimiq.dev/mini-apps/features/device-identifier). Device and origin scope limitations.
[^23]: Dotneet. [Prisma schema](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/prisma/schema.prisma). Audited main commit.
[^24]: Dotneet. [Identity claim route](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/identity/claim/route.ts#L4). Wallet ownership finding.
[^25]: Dotneet. [Profile route](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/profile/route.ts#L4) and [Posts route](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/posts/route.ts#L4). Authorization findings.
[^26]: Dotneet. [Endorsements route](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/endorsements/route.ts#L4) and [Reputation route](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/reputation/%5Bhandle%5D/route.ts#L14). Payment validation and score model findings.
[^27]: Dotneet. [Profile client](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/components/ProfilePageClient.tsx#L91). Verification-label behavior.
[^28]: Dotneet. [App page](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/app/page.tsx#L10). Returning-user flow and inactive actions.
[^29]: Dotneet. [Nimiq payment helper](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/lib/nimiq.ts#L86). Payment and memo handling.
[^30]: Dotneet. [Identity response](https://github.com/Mofe-Bankole/neet/blob/6677889fcbb782eef22223d8172bbc7584dda3ea/src/app/api/identity/%5Bhandle%5D/route.ts#L43). Returned fields and aggregation.
[^31]: Dotneet. [SDK README](https://github.com/Mofe-Bankole/neet/blob/0d2616899ff3c433031312b3d671bc9af7dcf2af/packages/sdk/README.md) and [SDK client](https://github.com/Mofe-Bankole/neet/blob/0d2616899ff3c433031312b3d671bc9af7dcf2af/packages/sdk/src/client.ts#L89). Separate SDK branch; publication not established.
[^32]: Dotneet. [Live site](https://dotneet.vercel.app/), [search read](https://dotneet.vercel.app/api/search?q=nee) and [linked API page](https://dotneet.vercel.app/api). Time-bounded public observations on September 10, 2026; deployment cause unconfirmed.

For submission logistics, consult the [official submission page](https://miniappscompetition.com/submit), [FAQ](https://miniappscompetition.com/faq) and [calendar](https://miniappscompetition.com/cycles). The published September 16 community-call times differ between pages; use the live event invitation to confirm the time. These operational details can change before submission.
