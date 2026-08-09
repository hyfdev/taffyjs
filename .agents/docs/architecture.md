# Architecture

The repository starts as a small Rust and JavaScript monorepo so the native implementation and npm packaging have clear owners without creating abstractions before they have a second user.

## Rust workspace

- Cargo workspace members live under crates/.
- crates/taffyjs_binding is the only Rust crate at bootstrap. It owns the napi-rs adapter and depends directly on Taffy.
- Do not extract a shared Rust crate until another Rust crate needs shared implementation; one native adapter does not justify a separate core crate.

## JavaScript workspace

- npm packages live under packages/ and use the Vite+ workflow from the repository root.
- packages/node owns the @taffyjs/node loader, generated declarations, tests, and npm metadata. The Rust implementation remains in crates/taffyjs_binding so npm packaging does not become the Rust workspace boundary.
- Platform-specific native packages use the @taffyjs/binding-<platform> naming scheme. @taffyjs/node remains the user-facing entry point that selects the matching native package.
- A future @taffyjs/node-yoga package should be a JavaScript or TypeScript compatibility layer depending on @taffyjs/node. It should not duplicate the native binding unless new evidence requires a different boundary.

## Bootstrap boundary

The temporary __bootstrap export exists only to prove that the native addon can build and load. It is not a proposed public binding API and should be removed when the first real binding surface is introduced.
