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
- packages/taffyjs-node is the independent package published as @taffyjs/node. It owns the JavaScript loader, generated declarations, rare package-local unit tests, and npm metadata. The Rust implementation remains in crates/taffyjs_binding so npm packaging does not become the Rust workspace boundary.
- Platform-specific native packages use the @taffyjs/binding-<platform> naming scheme. @taffyjs/node remains the user-facing entry point that selects the matching native package.
- A future @taffyjs/node-yoga package should be a JavaScript or TypeScript compatibility layer depending on @taffyjs/node. It should not duplicate the native binding unless new evidence requires a different boundary.

## Testing boundary

- JavaScript integration and end-to-end tests are the primary test flow for @taffyjs/node because they exercise the observable Node-API and package boundary.
- tests/taffyjs-node is an independent private JavaScript package that consumes @taffyjs/node through the workspace package dependency rather than a relative source path.
- Unit tests are exceptional and reserved for very critical isolated behavior. When needed, they live inside packages/taffyjs-node/tests/ and do not form another JavaScript package.
- crates/taffyjs_binding has no Rust test suite while it remains a thin binding over Taffy without independent behavior. Rust formatting, linting, and compilation checks remain part of repository verification; independent Rust logic would require revisiting the testing boundary.

The testing strategy and placement are vouched project direction in [@taffyjs/node decisions](taffyjs-node-decisions.md#javascript-integration-first-testing).

## Bootstrap boundary

The temporary __bootstrap export exists only to prove that the native addon can build and load. It is not a proposed public binding API and should be removed when the first real binding surface is introduced.
