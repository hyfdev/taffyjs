# Project Context Records

- [Intent](intent.md) — the package family, its intended users, and the questions deliberately left open during bootstrap.
- [Architecture](architecture.md) — top-level directory intent, Rust and JavaScript workspace boundaries, native distribution, testing placement, and the initial complete-snapshot boundary.
- [Output optimization research](output-optimization-research.md) — exploratory lazy and selective materialization designs, soundness findings, candidate designs, and the evidence required before reopening them.
- [Taffy-to-Node binding mapping](binding-mapping.md) — the repeatable rules for selecting Taffy's high-level Rust surface, mapping it through napi-rs, and preserving safety at the JavaScript boundary.
- [Binding mapping cases](binding-cases.md) — worked Rust-behavior-to-JavaScript-boundary examples used to test, refine, and explain the mapping rules.
- [@taffyjs/node API alignment TODOs](api-alignment-todos.md) — the high-level Taffy capabilities and transitive boundary questions that need later JavaScript alignment, with process and acceptance deliberately deferred.
- [Technology stack](technology-stack.md) — why napi-rs and Vite+ own different build stages and how repository tasks are composed.
- [@taffyjs/node decisions](taffyjs-node-decisions.md) — vouched rulings for the Node binding's role, API priorities, module format, distribution, and testing strategy.
- [Tooling decisions](tooling-decisions.md) — vouched rulings for JavaScript package builds and repository command orchestration.
