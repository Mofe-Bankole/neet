# Claude continuation prompt

Improve the Dotneet design system and the website pages in the attached handoff package. Work from the supplied implementation rather than recreating the product from a verbal summary.

Dotneet serves Nimiq Mini App builders and community contributors. Its promise is “Get paid. Keep the proof.” A contributor claims a .neet name using verified wallet control. A builder describes a contribution, authorizes a NIM payment and signs an acknowledgment. Dotneet independently checks the payment and signature. The contributor chooses whether to publish and share the receipt.

The project has one developer and an eight-day sprint constraint. Frontend: Next.js. Backend: Node.js route handlers. Database: PostgreSQL through Prisma. The next engineering agent may use OpenCode on Linux. This package contains a local implementation; native Nimiq Pay and real-network validation remain release requirements.

Read, in order:
1. README.md and docs/VALIDATION.md.
2. docs/01-PRD.md, docs/02-FRD.md and docs/04-DATA-AND-API.md.
3. docs/10-design-system.md, docs/11-cross-format-templates.md and docs/12-page-specifications.md.
4. docs/13-claude-handoff.md, screenshots/README.md and public/assets/README.md.
5. The actual source: src/design/, src/app/globals.css, src/components/system.tsx, forms.tsx, the connected page components, and their src/app/ entry points.

Assess visual hierarchy, typography, spacing, composition, brand distinctiveness, mobile clarity, accessibility, interaction feedback and the story a first-time visitor understands. Improve the shared design system and the pages together. Extend the same foundations into slide, social, video, diagram and report guidance. The current navy, offwhite and lime treatment is a version-one design direction that you may refine with reasons.

Protect these requirements:
- Preserve the API and data contracts unless you explicitly flag a proposed functional change.
- Wallet access, payment authorization and acknowledgment signing require explicit user actions.
- Never resend automatically after an unknown payment result. Preserve attempt-bound recovery and reconciliation.
- Keep payment status, signed acknowledgment, wallet control and publication consent distinct.
- Only the contributor can publish; private data must not enter public profiles or public API projections.
- Use precise verification language. Do not add “trusted person,” “verified human,” general reputation scores or unsupported Nimiq endorsement.
- Keep fictional samples labeled. Do not fabricate users, payments, signatures, integrations, testimonials or metrics.

Implement improvements through semantic tokens and reusable components. Update CSS/JSON tokens, the gallery, representative SVG templates, page specifications and documentation when a material decision changes. Avoid isolated one-page styling that makes the shared system inconsistent. Keep the source maintainable for a solo developer.

If you can run and edit the project, follow docs/09-LINUX-OPERATIONS.md. Run the relevant checks, inspect desktop and mobile layouts including 320px reflow, keyboard focus and partial/error states, then capture comparable after-screenshots. Only run integration tests against a dedicated local dotneet_test database. Do not claim native-wallet or chain checks unless you actually performed them.

Deliver a short prioritized assessment, the implemented refinements, an explanation of material changes, updated shared assets/documentation, before/after captures and exact validation results with remaining limitations. Completion means the pages and reusable system remain consistent and the protected functional behavior is preserved.

Do not deploy publicly, publish assets, send outreach, push code or initiate real payments under this prompt.

Access instructions: attach the entire source archive, or make its extracted files accessible. No access to prior conversations, repository credentials, local browser sessions or running previews is assumed. If archive inspection is unavailable, attach README, VALIDATION, PRD/FRD/API documents, design documents, screenshots, token files, globals.css and relevant components/pages individually.

If you can only review documents/screenshots, provide a prioritized review, concrete replacement tokens/copy, annotated layout recommendations and file-specific change instructions. Clearly label proposed code as unexecuted. Request only the missing files required for the next material decision; never imply you edited or tested unavailable code.
