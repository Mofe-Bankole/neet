# Claude handoff: Dotneet design system and website refinement

This guide travels with a self-contained source archive. Every path below is relative to the extracted `dotneet/` project root. No path requires access to Codex's filesystem or conversation history.

## Project and source status

Dotneet gives Nimiq community contributors memorable `.neet` names, NIM payments and signed acknowledgments they can inspect and share. Its promise is **Get paid. Keep the proof.** First users are Mini App builders and contributors helping with testing, translation, documentation and design feedback. The constraint is one developer and an eight-day implementation sprint using Next.js and Node.js, with Linux/OpenCode continuation.

The source derives from [Mofe-Bankole/neet](https://github.com/Mofe-Bankole/neet/) baseline commit `6677889fcbb782eef22223d8172bbc7584dda3ea`. This is the audited upstream baseline, not a claim that it contains the delivered implementation changes. The archive's current files are the handoff source of truth. A new handoff commit has not been assigned in this draft.

The design is implemented in `src/design/tokens.css`, `src/app/globals.css` and `src/components/system.tsx`. The palette is navy/offwhite/lime, with Arial/Helvetica/generic sans fonts and an offwhite receipt specimen. `src/design/tokens.json` mirrors the exact current CSS custom properties. Layout and typography sizes still partly live in global CSS; further extraction is a valid refinement opportunity.

The `/preview` and `/design-system` routes are implemented. Representative screenshots and local validation results are included; use `docs/VALIDATION.md` for final delivery status. Do not infer native-wallet, RPC, database or production readiness from the page design.

## Read these files first

1. `README.md` — package overview, setup and source status.
2. `docs/VALIDATION.md` — actual checks, limitations and current route status.
3. `docs/01-PRD.md` and `docs/02-FRD.md` — purpose, scope and required behavior.
4. `docs/03-ARCHITECTURE.md` and `docs/04-DATA-AND-API.md` — trust boundaries and contracts.
5. `docs/10-design-system.md` — reconciled design foundations and component behavior.
6. `docs/11-cross-format-templates.md` and `docs/12-page-specifications.md` — reusable templates and page requirements.
7. `src/design/tokens.css`, `src/design/tokens.json`, `src/app/globals.css`, `src/components/system.tsx` — actual design implementation.
8. `screenshots/README.md` — screenshot status and capture instructions; only the images listed here are delivered evidence.

Read `AGENTS.md` and `CLAUDE.md` before editing. The audited repository requires checking relevant installed Next.js documentation before coding; follow the instructions in the delivered source.

## Exact source references

| Area | Archive-relative path |
|---|---|
| CSS tokens and JSON mirror | `src/design/tokens.css`, `src/design/tokens.json` |
| Global layout and components styling | `src/app/globals.css` |
| Shared interface exports | `src/components/system.tsx` |
| Global document structure | `src/app/layout.tsx` |
| Landing page | `src/app/page.tsx` |
| Onboarding / returning owner | `src/app/app/page.tsx` |
| Public profile | `src/app/[handle]/page.tsx` |
| Acknowledgment flow | `src/app/acknowledge/page.tsx` — intended package route |
| Receipt detail | `src/app/receipts/[id]/page.tsx` — intended package route |
| Sample preview | `src/app/preview/page.tsx` — intended package route |
| Component/design gallery | `src/app/design-system/page.tsx` — intended package route |
| Developer reference | `src/app/api/page.tsx` — intended package route |
| Wallet/client integration | `src/lib/nimiq.ts`, `src/lib/client.ts` |
| Authentication and receipt services | `src/lib/server/auth.ts`, `src/lib/server/receipts.ts` |
| Independent verification | `src/lib/server/crypto.ts`, `src/lib/server/rpc.ts` |
| Data schema | `prisma/schema.prisma` |
| Dependencies / runtime | `package.json`, `package-lock.json` |
| Environment template | `.env.example` — no production secrets |

The intended routes must exist in the delivered archive or be marked incomplete in `docs/VALIDATION.md`. Do not invent missing components or assume the historical `src/components/landing/` and `src/components/ui/` files are the active rendering path; inspect imports from the current routes.

## Preview and editing access

The project declares Node.js `>=22.13.0` and npm scripts for development, build, lint, typechecking, local database and tests. From the extracted project root, start with `npm ci` and the final `README.md` setup instructions. `npm run dev` serves the ordinary local preview at `http://localhost:3000` unless the operator chooses another port. Database-dependent routes require `.env` configuration and the local or hosted database procedure in the operations guide; an unconfigured RPC must never manufacture confirmations.

If Claude can execute code, it should start the preview locally and inspect relevant pages. If it cannot, attach the documents and screenshots and request the review-only deliverables described below. Never send `.env`, credentials, database dumps, sessions or private keys. The previous live application is not a substitute for inspecting this archive.

## Refinement brief

Improve the design system and website together: content hierarchy, typography, spacing, visual identity, component consistency, mobile behavior, accessibility and clear transaction feedback. Start with the landing → onboarding → profile → acknowledgment review → receipt journey. Prefer shared changes with observable benefits over decorative animation or a new UI framework.

Established requirements are the `.neet` naming model, truthful proof boundaries, explicit authorization, recipient/amount/network visibility, safe recovery, publication consent, and sample/test labels. Composition, type scale, spacing, shapes, accent balance and explanatory wording are open to improvement. Explain material visual direction changes and update documentation alongside source.

Protect these facts:

- Wallet control, acknowledgment signature and confirmed payment are different checks.
- Neither a signature nor a payment independently proves work quality, human identity or honesty.
- A payment retry must inspect the existing intent/transaction before any new money movement.
- Cancelled, unknown and partially complete operations retain accurate status.
- Public routes and metadata must not reveal unpublished information.
- Sample records cannot authenticate a user or satisfy production verification.
- No reputation score, invented user count, fake testimonial, partner claim or institutional endorsement may be introduced.

Flag changes to these requirements as functional changes. Do not treat them as visual polish.

## Expected result and checks

Deliver a short prioritized diagnosis, updated tokens/components/pages, updated design and cross-format guidance, consistent before/after screenshots where possible, and a validation report. Run relevant declared checks and inspect responsive layout, keyboard navigation, focus, zoom/reflow, reduced motion, long handles/statements, errors and partial transaction states. State exactly which native Nimiq Pay/device checks were possible. Use the delivered screenshots as the baseline and capture comparable after-images.

For a review-only session, produce page/component findings, revised tokens/specifications and exact implementation instructions. Label them proposals and do not claim source edits or tests. Public deployment and external communications are outside this handoff.

## Copyable Claude continuation prompt

> Refine Dotneet's reusable design system and website using the attached self-contained source archive. Dotneet gives Nimiq community contributors `.neet` names, NIM payments and signed acknowledgments. Its promise is “Get paid. Keep the proof.” The stack is Next.js/Node.js; continuation uses Linux/OpenCode within a one-developer, eight-day scope.
>
> Start with `README.md`, `docs/VALIDATION.md`, `docs/01-PRD.md`, `docs/02-FRD.md`, `docs/03-ARCHITECTURE.md`, `docs/04-DATA-AND-API.md`, then `docs/10-design-system.md` through `docs/12-page-specifications.md`. Read `AGENTS.md` and `CLAUDE.md`. Inspect `src/design/tokens.css`, `src/design/tokens.json`, `src/app/globals.css`, `src/components/system.tsx` and relevant page files. All paths are relative to the extracted archive; do not assume access to Codex's environment or credentials.
>
> Improve hierarchy, typography, spacing, brand distinctiveness, shared components, mobile responsiveness, accessibility and interaction feedback. Update tokens, pages, gallery and cross-format guidance together. The navy/offwhite/lime design with Arial-first fonts is a starting point; explain material changes. Distinguish currently implemented behavior from intended routes and pending validation. Check `screenshots/README.md`; capture additional states only where the baseline lacks them.
>
> Preserve separate wallet-control, signature and payment facts; exact recipient/amount/network review; safe retry and partial states; publication consent; server-enforced privacy; and sample/test labels. Do not add trust scores, unsupported quality/identity claims, invented metrics or endorsements. Flag functional/data-contract changes separately from design refinement.
>
> Give a concise prioritized diagnosis, implement improvements when source editing is available, run appropriate checks, and deliver updated design docs, code, templates, screenshots and an honest validation log. If execution/editing is unavailable, deliver annotated findings and precise proposed changes instead. Do not claim tests or edits you could not perform. Do not publicly deploy or send external communications.
