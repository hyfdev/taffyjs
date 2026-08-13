# Project Context Records

- [Intent](intent.md) — the package family, its intended users, and the questions deliberately left open during bootstrap.
- [Architecture](architecture.md) — top-level directory intent, Rust and JavaScript workspace boundaries, native distribution, and testing placement.
- [Taffy-to-Node binding mapping](binding-mapping.md) — the repeatable rules for selecting Taffy's high-level Rust surface, mapping it through napi-rs, and preserving safety at the JavaScript boundary.
- [Selective query design notes](query-api-design.md) — the agreed high-level model for reading only selected Style, Layout, or DetailedLayoutInfo values without turning the API into a general query language.
- [Complete-output transport optimization](complete-output-transport.md) — the separate benchmark-gated direction for moving complete native values compactly and reconstructing their ordinary JavaScript snapshots.
- [Binding mapping cases](binding-cases.md) — worked Rust-behavior-to-JavaScript-boundary examples used to test and refine the mapping rules.
- [@taffyjs/node API alignment TODOs](api-alignment-todos.md) — the high-level Taffy capabilities and transitive boundary questions that need later JavaScript alignment, with process and acceptance deliberately deferred.
- [Technology stack](technology-stack.md) — why napi-rs and Vite+ own different build stages and how repository tasks are composed.
- [@taffyjs/node decisions](taffyjs-node-decisions.md) — vouched rulings for the Node binding's role, API priorities, module format, distribution, and testing strategy.
- [Tooling decisions](tooling-decisions.md) — vouched rulings for JavaScript package builds and repository command orchestration.
