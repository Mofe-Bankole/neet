# OpenCode implementation handoff — Linux / Next.js / Node.js

Status: archive-oriented handoff. All paths are relative to the extracted `dotneet/` source root. Read `README.md` and `docs/VALIDATION.md` for final delivery status; final checks and screenshots are recorded in those documents.

## Objective

Continue the existing Dotneet implementation until the agreed MVP provides a secure wallet-bound `.neet` identity, a builder-authorized NIM payment and signed contribution acknowledgment, independently checked receipt facts, and contributor-controlled publication/sharing. Preserve useful existing code and follow the delivered design system. Do not expand into a marketplace, escrow, dispute system, universal reputation score or broad SDK ecosystem.

The original repository is https://github.com/Mofe-Bankole/neet/, audited at baseline commit `6677889fcbb782eef22223d8172bbc7584dda3ea`. The delivered archive includes new work beyond that baseline and is the continuation source of truth. No new handoff commit is claimed. Do not overwrite the user's default branch or assume the live site runs this archive.

## Environment and access checklist

Use Node.js `>=22.13.0` and npm with the provided lockfile. Read `README.md` and the operations guide for database/provider configuration. Declared scripts are `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:local`, `npm run db:deploy` and `npm run test:integration`. The package must include files needed by the scripts; check `docs/VALIDATION.md` before claiming all have run. Inspect `package.json`, the lockfile and current `AGENTS.md`/`CLAUDE.md` before editing. The reviewed baseline includes a requirement to consult the installed Next.js guides; preserve and follow current repository instructions.

The sender supplies: source archive or repository access; central index; example environment file without secrets; database setup/migration guide; native Nimiq Pay test instructions; design tokens and assets; existing checks; screenshots; known blockers. No private keys, wallet seed phrases or production credentials belong in the handoff.

If access is missing, name the exact dependency and complete unaffected local work. Lack of a live wallet must not be worked around with production authentication bypass or fabricated verification.

## Reading order and working sequence

1. `README.md`, `docs/00-BASELINE-ASSESSMENT.md` and `docs/VALIDATION.md`.
2. `docs/01-PRD.md` and `docs/02-FRD.md`.
3. `docs/03-ARCHITECTURE.md` and `docs/04-DATA-AND-API.md`, plus the security/privacy guide.
4. `docs/05-IMPLEMENTATION-AND-TRACEABILITY.md`.
5. `docs/10-design-system.md`, `docs/11-cross-format-templates.md`, `docs/12-page-specifications.md`.
6. Setup/operations and acceptance tests, plus `.env.example`.
7. Actual code that implements the current slice; design source is `src/design/tokens.css`, its JSON mirror, `src/app/globals.css` and `src/components/system.tsx`.

For each slice, confirm the relevant requirements and state model, make the smallest coherent change, run the associated verification and update status. Treat documentation as the intended contract, code as evidence of current behavior, and current official integration documentation as evidence of platform capabilities. Record material discrepancies rather than silently picking a convenient interpretation.

## Priority order

1. Close unauthorized mutation, signature/replay and payment-verification gaps.
2. Deliver wallet ownership and returning-user flow.
3. Deliver acknowledgment draft/review plus independent payment and signature states.
4. Deliver safe recovery, duplicate prevention and receipt publication controls.
5. Finish main pages using shared design components.
6. Observe actual mobile/Nimiq Pay behavior and fix critical friction.
7. Add a minimal read integration only after core acceptance passes.
8. Align final documentation, screenshots, design gallery and agent handoffs.

Existing reputation and endorsement records are not automatically verified receipts. Follow the explicit migration policy. A library wrapper returning `success` or a hash is not sufficient evidence of a matching confirmed payment.

## Coding and product boundaries

- Next.js server routes on Node.js are the default backend unless the architecture records a concrete need for a separate service.
- Use the lockfile and existing dependencies where appropriate. Do not install a new framework to solve a small component problem.
- Keep authentication checks on the server. Handle/recipient query strings and client-provided wallet addresses are untrusted inputs.
- Persist operation identifiers before risky external actions where the architecture requires it; recover by inspecting current state rather than repeating a payment.
- Treat payment and signature completion independently. A confirmed payment with a cancelled signature remains a partial operation needing recovery.
- Use precise copy and named fact statuses; never show a quality score, certified identity or proof of work quality.
- Publication consent is separate from payment authorization. Protect public reads and metadata, not only UI visibility.
- Use a clearly isolated preview mode for fixtures. Do not permit demo verification evidence in production endpoints.
- Follow shared semantic tokens and components; update their documentation when changing contracts.
- Preserve uncommitted user changes and report conflicts. Avoid destructive resets, force pushes, production migrations or public deployment without applicable authorization.

## Progress-reporting format

For each meaningful completed slice, report:

- Requirement/task IDs completed.
- Changed components and behavior.
- Checks actually run and results.
- Remaining limitations or blockers.
- Next bounded task.

Do not produce lengthy logs in place of a conclusion. When stopping or handing off, update the central index, implementation status and validation report so another agent can continue without reading the conversation.

## Definition of done

The retained flow works through real supported integrations in the intended environment or its exact remaining blockers are plainly recorded. Unauthorized claims/mutations are rejected; a supplied hash cannot manufacture a confirmed receipt; safe retries do not repeat payment; a returning owner can recover their profile; public routes do not leak unpublished data; pages are usable on mobile and by keyboard; demo data remains labeled and isolated; docs and tests match the actual source.

Do not claim overall production readiness if required native-device, database or blockchain checks remain unperformed. Record individual completed deliverables and outstanding release gates instead.

## Ready-to-use OpenCode starting prompt

> Continue Dotneet from the source and handoff package supplied with this prompt. Dotneet gives Nimiq community contributors memorable `.neet` names, NIM contribution payments and signed acknowledgments with inspectable receipt facts. The environment is Linux, Next.js frontend and Node.js backend. Scope is one developer and an eight-day MVP; preserve useful existing code.
>
> Start with the central index, actual implementation status and repository instructions. Verify the source baseline, dependency versions, environment setup and available tests. Read the PRD/FRD, security/privacy requirements, architecture, API/data contract, implementation plan, design system and page specifications before modifying the relevant slice. Do not assume access to Codex's environment, credentials, wallet or conversation history.
>
> Follow the documented task order. Prioritize server-enforced wallet ownership, protected mutations, verified acknowledgment signatures, independently verified payments, safe retry and duplicate handling, then receipt visibility and usable pages. Keep payment and signature states separate. Do not manufacture proof from client inputs, wallet callbacks or demo records. Preserve explicit recipient/amount/network review, publication consent and accurate status copy.
>
> Reuse shared tokens/components and keep documentation consistent with the code. Avoid scope expansion, a universal reputation score, escrow, a task marketplace or unsupported partnership claims. Treat existing legacy records according to the migration policy rather than relabeling them as verified.
>
> Implement bounded slices, run meaningful checks, and report requirement IDs, behavior changes, actual validation and remaining blockers. Resolve routine reversible choices within the documented scope. Flag material requirement conflicts and access dependencies explicitly; continue unaffected work without inventing external capabilities. Do not publicly deploy, publish communications, force push or perform destructive production changes without authorization.
>
> Finish with updated source, setup instructions, implementation/validation status, representative screenshots and the Claude design-refinement handoff. Distinguish completed features from proposals and untested integrations. The goal is a coherent, secure, inspectable product that another agent can continue without reconstructing missing context.
