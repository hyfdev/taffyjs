# Project Context Records

- [Intent](intent.md) — the package family, its intended users, and the questions deliberately left open during bootstrap.
- [Architecture](architecture.md) — ownership, package boundaries, testing placement, and the complete-snapshot boundary.
- [Taffy-to-Node binding mapping](binding-mapping.md) — the repeatable rules for selecting Taffy's high-level Rust surface, mapping it through napi-rs, and preserving safety at the JavaScript boundary.
- [@taffyjs/node API alignment TODOs](api-alignment-todos.md) — performance and optional API questions that still require evidence.
- [Technology stack](technology-stack.md) — why napi-rs and Vite+ own different build stages and how repository tasks are composed.
- [@taffyjs/node decisions](taffyjs-node-decisions.md) — vouched choices for the Node binding's role, API priorities, module format, distribution, and testing strategy.
- [Tooling decisions](tooling-decisions.md) — vouched rulings for JavaScript package builds and repository command orchestration.
