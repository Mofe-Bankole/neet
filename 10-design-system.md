# Dotneet design system

Status: reconciled to `src/design/tokens.css`, `src/app/globals.css` and `src/components/system.tsx` on 11 September 2026. Current CSS values and exported component names below are implemented; broader behavioral requirements are specifications unless confirmed in `docs/VALIDATION.md`. Representative captures are listed in screenshots/README.md. Version 1.0.

## Intent and relationship to the existing product

Dotneet lets Nimiq community contributors receive payment and retain an attributable acknowledgment of their work under a memorable `.neet` name. The product promise is **Get paid. Keep the proof.** “Proof” means inspectable evidence of a signed statement and payment, with explicit limits; it does not certify a person's honesty or work quality.

The reviewed source used a white/offwhite and gold palette, Poppins, animated blurred orbs, glass surfaces, and reputation badges. Retain the `.neet` naming idea, public profile route, and existing reusable component responsibilities. The initial implementation changes the presentation to an editorial contributor ledger: near-black navy, offwhite type, a limited lime accent, thin dividing rules, and clear receipt facts. This is a deliberate redesign, not a claim that the reviewed branch already uses these colors.

### Brand principles

| Principle | Visual and content implication | Avoid |
|---|---|---|
| Give work a place to live | Contribution statements have more space than decorative badges; names are memorable and prominent | Reputation gauges, “top trusted” leaderboards |
| Make every claim inspectable | Label wallet control, statement signature and payment separately; link the supporting record | One generic “verified” seal covering the whole profile |
| Payment is a deliberate act | Strong recipient and amount hierarchy; clear review step; calm status feedback | Celebrations before confirmation, an ambiguous “Continue” payment button |
| Belonging without status games | Warm language, useful examples, equal-quality empty and populated profiles | Wealth as quality, rarity tiers, newcomer shaming |
| Reuse carries the brand | Semantic tokens and shared components; the same rules translate into decks and assets | Every page inventing a new card, radius or green |

Personality: clear, capable, welcoming, precise. Desired feeling: “My work has a record. I know what I am approving. I can inspect what happened.”

## Name, wordmark and Nimiq relationship

- Product name: **Dotneet** in prose; **.neet** may be the compact interface wordmark. Use `ada.neet` for a sample handle, always with sample labeling where it could resemble a real account.
- Tagline: **Get paid. Keep the proof.** Supporting line: **NIM payments and signed acknowledgments for useful contributions.**
- Use a typeset `.neet` wordmark with a lime dot and offwhite letters on navy, or navy letters on offwhite. Treat this as a simple version-one wordmark, not a trademark clearance or a finished custom font asset.
- Keep clear space of at least the rendered wordmark's lowercase letter height on all sides. Minimum legible width 64 CSS px in navigation and 18 mm in print. Never stretch, outline, bevel, or put the wordmark inside a faux certification badge.
- `.neet` is an application handle namespace unless an actual naming protocol exists. Do not call it a domain, DNS name, blockchain ownership token, or on-chain identity by implication.
- “For the Nimiq community” or “Payments through Nimiq Pay” may describe actual context/integration. Do not claim “official Nimiq identity,” “Nimiq certified,” or institutional endorsement. Only use an external Nimiq logo from an approved source with its applicable terms; a text attribution is sufficient for this MVP.

## Voice and interface vocabulary

Use sentence case. Write short, factual verbs. Address the current user's next decision and explain uncertainty without blaming them. Always show NIM units next to amounts; do not append fiat values without a named source and timestamp. Format dates readably and expose exact UTC timestamps in receipt details. Distinguish claimed date, signature date, payment confirmation, and publication date.

| Context | Approved wording | Avoid |
|---|---|---|
| Wallet control | “Wallet control verified” with explanation and verification timestamp | “Verified person”, “Identity approved” |
| Statement | “Acknowledgment signed by [wallet/handle]” | “Work verified by Dotneet” |
| Payment | “Payment confirmed” when independently checked | “Paid” from wallet callback alone |
| Unknown status | “Payment status unavailable. Check again.” | “Payment failed” when the network outcome is unknown |
| Payment pending | “Waiting for payment confirmation” | “Success” or celebratory animation |
| User cancels signing | “Signature cancelled. Your draft is saved.” | “Something went wrong” |
| Payment exists; signature incomplete | “Payment confirmed. Finish the acknowledgment.” | A button that starts the same payment again |
| First contribution | “Your first receipt starts with useful work.” | “Low reputation”, “Untrusted” |
| Publication | “Publish this receipt” plus exact visible fields | Prechecked consent, “Build trust now” |
| Demo | “Demo · sample data · no real payment” | A tiny footer disclaimer under a realistic transaction |

Confirmation copy must reflect actual state. Do not promise a saved draft if draft persistence failed. Do not promise deletion of immutable blockchain data. Evidence links are attributed external material, not an endorsement by Dotneet.

## Foundations and semantic tokens

The live styling source is `src/design/tokens.css`; `src/design/tokens.json` is its machine-readable mirror. The JSON records the exact 26 custom properties and the CSS file hash. `src/app/globals.css` currently contains additional layout/type sizes and several local presentation colors; these are not falsely represented as centralized tokens. Name refinements by semantic role, and update CSS, JSON, components and documentation together. A brand refinement should not scatter new hex codes through pages.

| CSS token | Value | Use |
|---|---|---|
| `--surface-base` | `#0B101B` | Page background |
| `--surface-panel` | `#121B29` | Quiet dark panels |
| `--surface-raised` | `#192436` | Secondary surfaces |
| `--surface-paper` | `#F5F7FB` | Paper receipt and light templates |
| `--text-primary` | `#F5F7FB` | Dark-surface headings/body |
| `--text-secondary` | `#A8B5C8` | Dark-surface explanatory text |
| `--text-on-action` | `#101609` | Dark text on lime actions |
| `--text-paper` | `#152033` | Main text on offwhite receipt |
| `--text-paper-secondary` | `#4F6075` | Secondary text on receipt |
| `--action-primary` | `#D5FA4B` | Main call to action and brand emphasis |
| `--action-primary-hover` | `#E3FF85` | Primary hover state |
| `--focus-ring` | `#D5FA4B` | Keyboard focus outline |
| `--border-subtle` | `#2B374A` | Decorative dividing rules |
| `--border-control` | `#66768D` | Inputs and interactive boundaries |
| `--status-success-bg` / `--status-success-text` | `#132C24` / `#8EE0B3` | A specific completed fact |
| `--status-pending-bg` / `--status-pending-text` | `#322918` / `#F0CC82` | Pending/attention state |
| `--status-danger-bg` / `--status-danger-text` | `#351E29` / `#FFA9B4` | Invalid input or confirmed failure |

Neutral informational states use the raised surface and secondary text. There is no separate information or tertiary text token in the current CSS.

Lime is an action/brand color, not the status “trusted.” Status must include text and, where helpful, a distinguishable icon. Use a neutral left rule on general receipt cards; no thick gold seal, score ring or “verified contributor” crown.

### Contrast and accessibility

Calculated opaque-token contrasts using the WCAG relative-luminance formula: primary text/base 17.73:1; secondary text/base 9.15:1; secondary text/raised 7.50:1; action text/lime 15.43:1; success text/background 9.53:1; pending text/background 9.32:1; danger text/background 8.46:1; control border/raised 3.37:1; paper text/paper 15.22:1; secondary paper text/paper 6.00:1. These are token checks, not proof of whole-site accessibility. Recheck actual computed colors, opacity, imagery, hover states and screenshots after implementation.

Target WCAG 2.2 AA: ordinary text at least 4.5:1 and large text at least 3:1. Use a clearly visible focus outline that remains visible under fixed headers or dialogs. Product touch target preference: 44 by 44 CSS px; this deliberately exceeds WCAG's 24 by 24 minimum criterion in ordinary cases. Do not rely on color alone. Sources: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

The current CSS applies `:focus-visible` with a 3 px lime outline and 4 px offset. Verify it on both navy and paper surfaces; a contrasting focus treatment on paper is a refinement candidate. Support keyboard-only interaction, 200% text zoom, narrow reflow, reduced motion, and semantic landmarks. Give form fields real visible labels and linked errors; focus the first invalid field after a failed submit. Disable neither pinch zoom nor screen-reader navigation. Do not reintroduce the legacy layout's `maximumScale: 1`. Current navigation is not sticky; if made sticky later, ensure focused/linked content clears it.

### Typography

Current body token: `Arial, Helvetica, sans-serif`. No downloaded font is required. Monospace token: `'SFMono-Regular', Consolas, 'Liberation Mono', monospace`. Use the mono family for addresses, hashes, IDs and amounts; body paragraphs remain sans serif.

Arial/Helvetica are fallbacks to installed fonts, not bundled files; do not redistribute proprietary font binaries. On Linux, the generic fallback may differ from Arial. For reproducible exported decks/documents, choose an available recipient-compatible font, record the choice and inspect substitution. An installed open font such as Liberation Sans can be used for office exports when available. Do not claim pixel-identical output across hosts.

The legacy source loaded Poppins through Next.js; the new layout no longer depends on that download. Any later font change requires a source/license record and visual QA.

| Current CSS role | Size / line height | Notes |
|---|---|---|
| Body | 16 px / 1.6 | Arial-first font token |
| Generic h1 | `clamp(2.5rem, 6vw, 5.75rem)` / 1.12 | Weight 600; −0.035em tracking |
| Landing mobile h1 | `clamp(3.6rem, 12vw, 5rem)` | Media override under 760 px; check at 320 px |
| h2 | `clamp(2rem, 3.8vw, 3.4rem)` / 1.12 | Component-specific overrides exist |
| h3 | 1.35 rem / 1.12 | Weight 600 |
| Page intro title | `clamp(2.25rem, 4vw, 3.75rem)` | Narrower than landing heading |
| Profile identity | `clamp(2.5rem, 5vw, 4rem)` | `overflow-wrap:anywhere` |
| Landing lead | 1.125 rem / 1.7 | Mobile 1 rem |
| Label / small | 0.875 rem | Ordinary readable metadata |
| Eyebrow / caption | 0.75 rem | Brief metadata; eyebrow mono/uppercase |
| Paper amount | 1.85 rem | Mono, weight 500, −0.04em |

Typography and spacing are currently CSS rules rather than a complete semantic token scale. Extracting reusable type/spacing roles is a reasonable Claude refinement, but is not claimed as completed work. Keep amount precision and full values intact; do not substitute rounded presentation values where they change the approved payment.


### Layout, spacing, borders and motion

Current container: maximum 1200 px, with 40 px outer gutters at wide sizes, 24 px under 1000 px and 16 px under 760 px. Current media breakpoints are 1000 and 760 px, not a framework-default 640/768/1024 scale. The main narrow task surface is 650 px. Desktop layouts use content-specific grids: landing 1.13fr/0.87fr, task panels 1.2fr/0.8fr, profile facts 250 px plus content, receipt detail flexible content plus 350 px aside (300 px under 1000 px). Main grids collapse under 760 px.

Spacing uses explicit CSS values. Common intervals are 8, 12, 16, 20, 24, 28, 32, 40, 48 and 64 px, plus larger editorial section spacing. Page layout must be tested at 320, 390, 768 and 1440 px. Do not force desktop facts into page-level horizontal scrolling; long hashes and evidence links use wrapping.

Implemented radius tokens: control 8 px, panel 14 px. Badges use a local 4 px radius, avatar 20 px (14 px mobile), and specimen layers reuse panel radius. Normal rules are 1 px. `--shadow-paper` is `0 22px 64px #0000002B`, used for the offwhite receipt. Ordinary dark panels remain flat.

Implemented motion token: `140ms ease`; buttons lift by 1 px on hover. Reduced-motion media styles disable animation, transitions and this lift. There are no active animated orbs. Never animate a state to “confirmed” before the verifier result.

Current primary button min-height is 46 px; the small navigation link variant is 38 px. The product preference is 44 px touch targets; inspect small controls and hit-area spacing on mobile rather than claiming every control already meets that preference. Current source exports no general dialog or menu component and no centralized layering scale.


## Components and behavior

The active shared exports in `src/components/system.tsx` are `ArrowIcon`, `CheckIcon`, `Button`, `ActionLink`, `Badge`, `Notice`, `Header`, `Footer`, `PageShell`, `PageIntro` and `SampleReceipt`. `Button` variants are primary/secondary/ghost/danger; `ActionLink` supports primary/secondary/ghost and small; `Badge` tones are neutral/success/pending/danger; `Notice` tones are neutral/error/warning/success. Notice uses `role=alert` for errors and `role=status` otherwise. Current navigation hides secondary links under 760 px and preserves app/sample entry; it does not implement a mobile menu.

Forms and receipt/detail styles currently use shared CSS classes rather than dedicated exported `TextField`, `ReceiptCard` or `FactStatus` components. The table below describes desired contracts; named patterns are not a claim that each exists as a standalone component. Extract additional components only where reuse or accessibility warrants it.

| Component | Variants and behavior | Accessibility/content requirements |
|---|---|---|
| Button | Primary lime; secondary border; quiet text; destructive explicit. Default, hover, focus, pending, disabled. One dominant action per decision surface | Use button for actions, link for navigation. Pending label describes operation; prevent duplicate submit without trapping focus |
| TextField/TextArea | Label, helper, optional prefix/suffix, error, disabled/read-only | Persist visible label; connect hint/error with `aria-describedby`; 16 px minimum input text; do not clear valid fields after an error |
| HandleInput | `.neet` suffix outside editable text; normalized availability result; pending/error/taken | “Available” is provisional until server claim succeeds; avoid screen-reader announcements on every keystroke |
| Navigation | Wordmark; short primary links; selected route; secondary links hidden on mobile | Include skip link; preserve access to necessary destinations; if adding disclosure, use `aria-expanded`, Escape and focus handling |
| ProfileHeader | Handle, optional display name/bio, wallet fact, receipt facts, actions | Claim dates are not identity verification dates; no score or wallet-wealth ranking; clamp long metadata only with a full readable expansion |
| ReceiptCard | Contribution statement first; issuer and date; amount; separate signature/payment facts; inspection link | Make the card's action an actual link; avoid nested interactive elements within a clickable wrapper |
| FactStatus | Positive, pending, incomplete, unavailable and invalid status for one named fact | Text includes what was checked, not “Verified” alone; explanatory text accessible by disclosure, not hover only |
| PaymentSummary | Recipient handle and wallet, amount/NIM, network, separate wallet fee information when available, purpose | Recipient and amount remain visible at approval; no automatic sending; unknown fees say so |
| ProgressSteps | Draft → wallet approval → payment check → signature check → receipt; actual backend may use independent payment/signature states | Completed indicator only for completed work; text status; no implied transactional rollback |
| EvidenceLink | Explicit title/domain plus external indicator | Permit supported safe URLs only; never fetch arbitrary evidence from the server merely to decorate a card |
| ConsentControl | Unchecked publish decision with exact visible fields | Consent is not bundled into payment; preserve accessible labels and explain that blockchain payment data remains public |
| Notification | Inline field error, persistent operation alert, brief copy success toast | Critical transaction outcomes remain in-page; `role=alert` for urgent errors, polite live updates for progress; no auto-disappearing sole evidence |
| Dialog/Disclosure | Use only where needed for confirmation or details | Dialog title/description; focus trap if modal; Escape/cancel; return focus to trigger; details element preferred for simple technical facts |
| CopyShare | Copy link or address; native share when supported with copy fallback | Copy actual value rather than truncated display; announce success only after clipboard promise resolves |
| Skeleton/Empty/Error | Preserve layout, concise empty guidance, retry on retriable fetch | Skeleton is not content; never show fake verified numbers while loading; unknown wallet state isn't a “new user” claim |

The component reference at `/design-system` includes live examples of essential variants and states. Browser gallery behavior must be clearly separated from actual wallet approval and payment operations.

## Page patterns

Landing: a spacious typographic promise paired with one readable sample receipt; short explanation of the three facts; three steps; builder-oriented reuse explanation; a clear start action and secondary sample preview. Avoid a large unproven usage counter or partner-logo wall.

App/onboarding: a narrow, progressive task surface; explain the wallet challenge before opening it; separate wallet access from ownership proof; let returning users recover their existing handle; do not force them to register again.

Profile: identity at the top, a primary acknowledgment action, then receipt list and inspectable details. Keep contribution content visible without needing to connect a wallet. Show a useful empty state instead of an invented receipt.

Acknowledgment: focused form beside a compact review receipt on wide screens; stack on mobile. Make approval amount, network and recipient explicit. After cancellation or an unknown response, retain a recovery action that cannot blindly repeat payment.

Receipt: statement, issuer, contributor, amount, network and dates; separate named fact statuses; evidence and transaction links; publication state. A public route must enforce visibility on the server rather than hiding fields with CSS.

## Source and asset register

| Asset | Source | Status / rights handling |
|---|---|---|
| `.neet` text wordmark | Original typesetting in implementation | Proposed; editable text/vector; no trademark clearance implied |
| Arial/Helvetica/generic sans and mono fallbacks | Installed OS fonts | No binary redistribution; rendering depends on host |
| App icons | Existing dependency or original simple SVG | Final implementation records exact library/license if used |
| People/names/receipts in demo | Clearly labeled illustrative fixtures | Not real testimonials, users or blockchain evidence |
| Nimiq branding | External | Not included unless approved source and usage terms are recorded |
| Screenshots | Newly implemented preview | Identify demo/test state and viewport; remove private data |

Do not include downloaded photos, copied competitor layouts, sponsor badges, unverifiable user portraits, invented testimonials, or third-party logos without provenance.

## Refinement acceptance

The design system is usable when the same tokens and component names control the main pages, the receipt is readable at 390 px width, wallet/payment/statement facts cannot be confused, keyboard focus remains visible, page zoom works, the gallery demonstrates required states, and cross-format templates inherit the same foundations. Record actual checked viewports and failures in the final validation log. An attractive screenshot alone does not satisfy these criteria.

## Delivered implementation references

The final token export contains 41 CSS variables: the original semantic palette plus common spacing, control height, container width and small type sizes. Responsive thresholds are recorded separately in tokens.json because CSS variables cannot be substituted into media-query conditions. Run `npm run tokens:export` after changing CSS, then `npm run assets:export`. The source hash detects drift between the CSS and JSON snapshots.

`src/components/forms.tsx` supplies Field, TextField, NetworkBanner, SessionGate and ShareButton. `ReceiptCard.tsx` supplies real record cards. Product forms use plain labeled fields rather than a separate HandleInput class. Receipt withdrawal uses the browser’s native confirmation dialog; a custom modal system is deferred. Notices provide persistent inline feedback. Buttons are 48 px high; compact navigation links are 38 px high. Under 400 px the sample-navigation label shortens to “Sample.” Receipt links use a dark green focus ring on paper surfaces for contrast.

Assets in `public/assets/` are implemented editable SVG layouts and a wordmark. The representative templates are not a finished pitch deck; demo and URL placeholders must be replaced before publication. The browsable reference links to actual SVG exports. See [asset usage](../public/assets/README.md).
