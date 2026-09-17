# Dotneet cross-format templates and asset guide

Status: reusable specifications and editable content skeletons. Browser template examples are implementation deliverables; an exported PowerPoint or complete campaign asset library is not implied. Use the final file manifest to see which artifacts were actually produced.

Read `10-design-system.md` first. This guide translates the same brand foundations into presentations, social posts, video frames and documents. Do not convert a website screenshot into a slide layout and call it a template.

## Shared composition rules

Use a navy canvas, offwhite text, restrained lime emphasis and aligned ledger rules. A presentation slide has one argument. A social graphic has one hook. A receipt has one contribution and its supporting facts. Use ample negative space and left alignment for reading; avoid decorative 3D coins, shields and false certification stamps.

Use 16:9 slides at 1920 × 1080 logical pixels or 13.333 × 7.5 inches. Safe margin is 96 px / approximately 0.67 inches. Use a 12-column conceptual grid with 24 px gaps. Place a small `.neet` wordmark in a consistent corner and a discreet page number/source area at the foot. Do not fill the margin with ornamental labels.

Presentation size guidance: title 48–64 pt; section heading 32–40 pt; body 24–30 pt; captions 16–18 pt; footnotes 12–14 pt for a leave-behind only. If a projected slide requires a footnote to understand the claim, bring it into the main content. Match the web's Arial/Helvetica/generic sans roles with an installed readable sans font and verify font substitution after export. The source archive does not redistribute proprietary fonts. Use editable text and shapes for important content; raster assets should be secondary.

## Seven slide masters

| Master | Layout and content | Editable skeleton | Guardrail |
|---|---|---|---|
| 01 — Title | Oversized left-aligned promise, small brand and competition context, right third for a receipt fragment or `.neet` handle | “Get paid. / Keep the proof.”; “NIM payments and signed acknowledgments for useful contributions.”; `[presenter] · [date]` | No prize badges, invented partners or “official Nimiq” label |
| 02 — Problem | One large statement, then three short fragments representing where acknowledgment gets lost | “Useful work deserves more than a disappearing thank-you.”; `[real interview observation]`; `[source/date]` | If unvalidated, label “Problem hypothesis”; do not invent quotes |
| 03 — Solution | Three numbered columns: contribute, pay + sign, keep the receipt; a single connective ledger line | “From contribution to an inspectable record.”; one sentence per step | Payment and signature remain separate actions/checks; never imply quality is independently certified |
| 04 — Product demo | One large screenshot in a simple device frame, two or three anchored callouts, a concise action caption | `[screenshot]`; “Recipient and amount”; “Signed statement”; “Payment record” | Every sample screenshot says “Demo · sample data”; no unreadable collage of six screens |
| 05 — Evidence | Three well-defined metrics or two findings plus one quote; each has scope, date and denominator | `[N] participants observed`; `[X/Y] completed the flow`; `[N] verified receipts`; `[observation window]` | Use “Pilot targets” until measured. Distinguish wallets, people, sessions and repeat users |
| 06 — Roadmap | Three short columns labeled Now / Next / Later, with dependencies and a clear eight-day boundary | Now: secure core flow; Next: observed community pilot; Later: one useful integration | No dates or partners presented as commitments without agreement |
| 07 — Closing | A single invitation, short URL or tested QR, concise product promise | “Make useful work visible.”; `[confirmed demo URL]`; “Get paid. Keep the proof.” | QR must resolve to the intended page and be tested at viewing distance; do not add a fake availability promise |

Optional speaker notes should contain technical caveats and transition text rather than paragraphs displayed on the slide. The seven master types are templates; there is no requirement to produce a complete seven-slide pitch in this sprint.

### Example slide content hierarchy

Title master: wordmark 28 px at upper left; eyebrow 18 px at y=190; title 96 px at y=270 within 1100 px; lead 30 px at y=530 within 950 px; small presenter/date at bottom. Receipt specimen may occupy the right 500 px if it does not compress the title below its intended scale.

Evidence master: heading spans the top; three equal columns below, each with a 72 px metric, a 26 px definition and 20 px context. Use dashes rather than placeholder statistics in outward-facing exports. Put source/date directly under the related metric. This is a design recipe, not evidence that metrics exist.

## Social graphics

These dimensions are reusable production canvases, not claims about a platform's current required dimensions. Check the destination's preview and cropping before publishing.

| Format | Canvas | Safe area | Composition |
|---|---|---|---|
| Landscape announcement | 1600 × 900 | 80 px all sides | Left 60%: short headline and one-line context. Right 40%: one receipt fragment. Wordmark/URL low but inside safe area |
| Square card | 1080 × 1080 | 80 px | Wordmark at top, 2–3-line headline, receipt or handle in middle, one CTA at bottom |
| Portrait explainer | 1080 × 1350 | 80 px | Short headline, three sequential facts/actions, clear final CTA |

Use headline text of approximately 72–100 px and body 32–40 px at the source canvas; check readability on a phone thumbnail. Each graphic should work without the caption but not repeat a complete paragraph. Keep a single primary accent.

Reusable announcement skeleton:

> **Your contribution. On record.**
>
> Get paid in NIM and keep a signed acknowledgment under your `.neet` name.
>
> `[Open the demo / Try the verified flow — choose only the accurate action]`

Alt-text skeleton: “Dotneet announcement showing [headline] beside a [demo/real, with consent] contribution receipt for [contribution]. The receipt separates acknowledgment and payment status.” Do not put essential explanation only in decorative image text; repeat necessary information in the accompanying post.

## Demo-video frames and recording guidance

Canvas: 1920 × 1080, 30 fps unless the recorded material requires another rate. Use a static opening frame for about 2 seconds and a closing frame for about 3–4 seconds. The recording itself must show actual interaction and status rather than a fictional animation of confirmations.

Opening template: `.neet` upper left; “Get paid. Keep the proof.” large; subline “A contribution receipt on Nimiq”; prominent “Testnet demo” or “Sample walkthrough” if applicable.

Closing template: “Make useful work visible.”; the real demo URL; wordmark; optional QR after testing. Keep context labels visible. Do not show inaccessible QR as the only destination.

Suggested two-minute story: 10 seconds to describe the useful contribution, 20 seconds to inspect the named recipient and statement, 35 seconds for wallet approvals, 25 seconds for separate receipt facts, 20 seconds for sharing/inspection, and 10 seconds for observed pilot evidence and the next action. This is a proposed edit plan, not a competition-mandated duration.

Provide captions and a transcript when producing a video. Hide private sessions/keys and never expose a seed phrase. Do not silently cut a pending payment into a confirmed state and imply it was instantaneous. If time is compressed, label the cut.

## Reports and documentation

Default print layout: A4 with 20 mm margins; white/offwhite paper; navy text; lime used as a small rule or highlight containing navy text. Use the same semantic roles adapted for light paper, with recalculated contrast. Navy pages are optional title dividers, not the body of an ink-heavy report.

Document typography: title 28–34 pt, h1 20–24 pt, h2 15–18 pt, body 10.5–11.5 pt at 1.35–1.5 spacing, caption 9–10 pt. Use a running title, version/date and page number. Tables should use light horizontal rules, no vertical cage, repeated headers, and sensible page breaks. Keep links descriptive and sources adjacent to claims.

Documentation master:

1. Cover: title, product promise, version, date and author.
2. Overview: context, scope and implementation status.
3. Main pages: numbered sections and readable tables.
4. Evidence/limitations: actual checks and remaining requirements.
5. Appendix: file inventory, terminology and sources.

Do not treat a Markdown file as proof that its PDF or DOCX export renders correctly. If a later task requests office files or PDF, create and visually inspect the actual export at that point.

## Diagrams and screenshots

Use simple labeled nodes and clear directional arrows. A user, Dotneet's hosted server, Nimiq Pay and the blockchain verifier must remain visibly separate where the distinction matters. Label the hosted boundary. Do not place the database inside a generic blockchain icon.

Colors: navy or paper canvas, offwhite/navy labels, lime for the current path, muted slate for contextual paths. Use text labels and line styles so the diagram remains understandable in grayscale. Export SVG for editable linework; PNG at 2× for raster consumers. SVG must include a title/description or have accompanying alt text.

Seven representative local screenshots are included; see [the capture inventory](../screenshots/README.md) for their page states, viewport sizes and data modes. For future captures, include page context, crop without changing facts, and retain illustrative-data labels. Do not stitch mutually exclusive transaction states into one screenshot. Record filename, route, viewport, data mode and capture date alongside each capture.

## Asset-generation prompts

These are reusable prompts, not claims that images have already been generated. Prefer HTML/CSS/SVG for words, logos, receipts and diagrams; generated bitmap backgrounds should not contain essential text or factual badges.

**Editorial supporting illustration**

“Create a restrained editorial illustration for Dotneet, a product where community contributors retain records of NIM payments and signed acknowledgments. Show three abstract paper-like record panels connected by a fine line, with generous negative space for text added later. Near-black navy #0B101B background, offwhite #F5F7FB panels or strokes, one electric-lime #D5FA4B accent, subtle slate. Flat, precise, quietly human, no glossy 3D. No words, logos, wallet addresses, numeric scores, coins, padlocks, shields, seals, official symbols or certification marks. Landscape 16:9. The image is decorative and must not imply security guarantees.”

**Social background variant**

“Create an abstract sparse background for a Dotneet social announcement: near-black navy, fine editorial ledger lines, one lime marker near the lower right, open left and central area for high-contrast text that will be added separately. Crisp flat shapes, no gradients or glow, no text or logos, no financial charts, no badges. Square 1:1. Preserve an 8% safe margin.”

**Contribution category illustration**

“Create a single-color line illustration representing [testing / translation / documentation / design feedback] for Dotneet. Use an original, simple 24-unit icon-like composition with uniform rounded strokes, offwhite on transparent background or navy. No letters, brand marks or approval checkmark. Provide a clear silhouette at small sizes. This is a concept reference; final interface icon should be drawn as accessible SVG.”

**Presentation diagram brief for an editing tool**

“Draw editable vector shapes showing: Contributor → Builder acknowledgment + NIM payment → Dotneet verifies the signature and transaction separately → Contributor chooses publication → Shareable receipt. Label each actor and action. Separate hosted Dotneet processing from Nimiq Pay authorization and blockchain data. Use the Dotneet palette, clear readable text, thin rules and generous spacing. Add the footnote: ‘An attributable statement and payment do not independently prove work quality.’”

## Production and rights checklist

Maintain a manifest containing filename, intended use, dimensions, editable source, export format, source/creator, license or permission where applicable, data mode and approval status. No actual private key or credential should appear in an asset. Sample names and receipts must be labeled and must not impersonate real endorsements.

Before an external release, inspect cropping, text legibility, color contrast, claims, timestamps, QR resolution, sample labeling and usage rights. Report exports as finished only after inspecting the actual result.

## Actual exports in this package

Editable exports are in `public/assets/templates/`: 01-title-slide.svg, 02-problem-slide.svg, 03-solution-slide.svg, 04-demo-slide.svg, 05-evidence-slide.svg, 06-roadmap-slide.svg, 07-closing-slide.svg, 08-social-announcement.svg, 09-video-opening.svg and 10-video-closing.svg. The wordmark is `public/assets/brand/dotneet-wordmark.svg`. Source generation reads the shared tokens. These SVGs are representative examples of the specifications above, not native PowerPoint/Keynote masters or finished competition media. No screenshots, payment results or adoption figures are invented in the templates.

Regenerate with `npm run tokens:export` and `npm run assets:export`. Inspect exports after any material font, token or copy change. Keep typography editable in SVG; convert to PNG at 1920×1080 for slides/video and 1080×1080 for the square social layout. Do not stretch the aspect ratio. Check font substitution and text fit in the destination application.
