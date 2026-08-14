# Architecture

This repository is a small Rust and JavaScript monorepo with one native binding and one public package.

## Ownership

- `.agents/` holds durable project intent and decisions that cannot be expressed in code or configuration.
- `crates/taffyjs_binding` owns the napi-rs adapter and depends directly on Taffy. A shared Rust crate is justified only when a second Rust consumer needs it.
- `packages/taffyjs-node` owns the public ESM wrapper and declarations, the private napi-rs loader and declarations, and npm metadata. The wrapper owns JavaScript-only NodeId validity data and context; Taffy owns topology, Style, Layout, cache, and computation state.
- `tests/taffyjs-node` is a private consumer package that tests `@taffyjs/node` through its package boundary.

The public package includes the napi-rs root loader as a private module. That loader selects the matching optional platform package. There is no intermediate binding package, custom loader, JavaScript shadow tree, or separate core crate.

A future Yoga package should be a JavaScript or TypeScript compatibility layer over `@taffyjs/node` unless a concrete need requires a different native boundary.

## Testing

JavaScript integration tests are the primary proof of observable behavior. Package-local JavaScript and Rust unit tests are limited to critical behavior that is clearer in isolation. Maintained test names follow product behavior rather than temporary milestone or acceptance labels.

## Read boundary

Style, Layout, detailed Grid data, child arrays, and measure arguments cross the boundary as complete detached values. Binding-produced records are recursively readonly in TypeScript but remain ordinary mutable objects at runtime. No live Rust borrow, native-backed view, cache, lazy property, selector, prepared query, or batch snapshot is part of the current API.

Only a real consumer workload and complete measurements can justify another read path; that work is tracked in [API alignment TODOs](api-alignment-todos.md).
