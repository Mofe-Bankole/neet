# Self-contained archive and transfer instructions

Extract the archive to a new directory named dotneet. Paths in the documentation are relative to that source root.

The archive contains:

- README.md, AGENTS.md, SOURCE-MANIFEST.json and the Node/Next/TypeScript/lint/format configuration.
- package.json and package-lock.json; .env.example; compose.yaml.
- src/: all page, component, domain and server implementation.
- prisma/: legacy-schema reference, current schema, migration lock and both SQL migrations.
- tests/: unit fixtures and isolated HTTP/PostgreSQL lifecycle harness.
- examples/: minimal public-profile integration example.
- scripts/: semantic-token synchronization and SVG asset export.
- public/: existing public files plus the new wordmark, template SVGs and usage guide.
- docs/: product, engineering, design, operations, status, source research and agent handoffs.
- screenshots/: representative captures and their viewport/data-mode inventory.

The archive excludes .git, .env and other secret configuration, node_modules, Next build directories, local databases, tooling runtimes, test process logs and browser sessions. Install dependencies locally from the included lockfile; do not copy a macOS node_modules directory to Linux.

SOURCE-MANIFEST.json records the upstream baseline, local handoff commit and file hashes. It is generated after the source commit and intentionally excluded from its own hash list and from Git tracking. The archive includes the manifest alongside that committed source snapshot. The snapshot was not pushed to the public repository. A receiver can use the archive directly, or compare it with the upstream baseline before applying changes to another checkout. Preserve any subsequent user changes.

For Claude, provide the complete archive and docs/CLAUDE-CONTINUATION-PROMPT.md. If the interface cannot inspect archives, attach the index, validation report, design documents, screenshots, token files, global styles and relevant source files individually. The review-only alternative is specified in the Claude handoff.

For OpenCode, make the extracted directory accessible in Linux and start with docs/OPENCODE-START-PROMPT.md. Supply secrets separately only in the target environment. Native-wallet/browser sessions and database credentials do not transfer with this package.

The tested source and evidence are fixed at this delivery. New changes require their own relevant validation. Public deployment remains a separate action.
