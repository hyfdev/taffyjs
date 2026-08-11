# Architecture

The repository starts as a small Rust and JavaScript monorepo so the native implementation and npm packaging have clear owners without creating abstractions before they have a second user.

## Top-level directories

- `.agents/` holds Project Context Records: durable project intent, architecture, and vouched decisions that cannot be enforced more strongly in code or configuration.
- `crates/` holds Rust crates that implement native adapters or future shared Rust components justified by more than one consumer.
- `packages/` holds independent JavaScript package boundaries, including their package-local unit tests when a critical behavior warrants them. This directory structure does not decide whether package versions are coordinated or released independently.
- `tests/` holds private JavaScript consumer packages for integration and end-to-end testing across published package boundaries.

## Rust workspace

- Cargo workspace members live under crates/.
- crates/taffyjs_binding is the only Rust crate at bootstrap. It owns the napi-rs adapter and depends directly on Taffy.
- Do not extract a shared Rust crate until another Rust crate needs shared implementation; one native adapter does not justify a separate core crate.

## JavaScript workspace

- npm packages live under packages/ and use the Vite+ workflow from the repository root.
- packages/taffyjs-node is the independent package published as @taffyjs/node. It owns the authored public ESM wrapper and declarations, the private napi-rs-generated ESM loader and declarations, rare package-local unit tests, and npm metadata. The Rust implementation remains in crates/taffyjs_binding so npm packaging does not become the Rust workspace boundary.
- @taffyjs/node is the user-facing package and contains the napi-rs root loader as a private implementation module. The authored public wrapper owns JavaScript-only NodeId validation metadata and calls the private native surface. The loader selects an optional platform-specific @taffyjs/binding-<platform> package; there is no intermediate generic binding package or additional custom loader build.
- A future @taffyjs/node-yoga package should be a JavaScript or TypeScript compatibility layer depending on @taffyjs/node. It should not duplicate the native binding unless new evidence requires a different boundary.

The module format and native distribution model are vouched project direction in [@taffyjs/node decisions](taffyjs-node-decisions.md#esm-only-package-entry) and [@taffyjs/node decisions](taffyjs-node-decisions.md#napi-rs-platform-package-distribution).

## Testing boundary

- JavaScript integration and end-to-end tests are the primary test flow for @taffyjs/node because they exercise the observable Node-API and package boundary.
- tests/taffyjs-node is an independent private JavaScript package that consumes @taffyjs/node through the workspace package dependency rather than a relative source path.
- Unit tests are exceptional and reserved for very critical isolated behavior. When needed, they live inside packages/taffyjs-node/tests/ and do not form another JavaScript package.
- crates/taffyjs_binding has no Rust test suite while it remains a thin binding over Taffy without independent behavior. Rust formatting, linting, and compilation checks remain part of repository verification; independent Rust logic would require revisiting the testing boundary.

The testing strategy and placement are vouched project direction in [@taffyjs/node decisions](taffyjs-node-decisions.md#javascript-integration-first-testing).

## Bootstrap boundary

The temporary __bootstrap export exists only to prove that the native addon can build and load. It is not a proposed public binding API and should be removed when the first real binding surface is introduced.

## Complete owned snapshots

The initial read boundary uses complete owned snapshots. `getStyle(node)` returns one complete recursively readonly `Style` ordinary plain object, and every actual measure callback receives a complete owned Style snapshot in the same representation. These values are eagerly materialized, independent from native state, and neither frozen, sealed, proxied, nor cached. No live Rust borrow or native-backed view escapes.

The initial implementation has no lazy snapshot, selective query, prepared query, output cache, or batch snapshot facility. Those mechanisms would add new optimization APIs or representations without changing the complete getter's meaning, so they remain outside the initial API and implementation work. Internal field converters may stay composable so later measured work can reuse them, but this does not require a public selector framework now.

The exploratory designs, rejected assumptions, viable query shapes, soundness traps, and evidence required to reopen output optimization are recorded in [Output optimization research](output-optimization-research.md). A future optimization must identify its actual workload first: repeated direct reads, many nodes crossing the boundary, nested collection projection, or measure-callback delivery can require different solutions.
