# Technology Stack

## Native bindings and distribution

napi-rs owns the Rust-to-Node boundary, private native declarations, native loader, and target-specific package metadata. `@taffyjs/node` passes `--esm` to the napi-rs build rather than transforming the generated loader into another module format.

The generated ESM loader is packaged inside `@taffyjs/node` but is not a public entry. The authored wrapper imports it privately and does not re-export raw native operations.

The root package has exact-version optional packages for the two supported targets: `@taffyjs/binding-linux-x64-gnu` and `@taffyjs/binding-win32-x64-msvc`. Publication is not configured.

The bigint NodeId marker and its JavaScript validity registry require the authored wrapper, but not a custom loader or another package.

## JavaScript package builds

Vite+ is the JavaScript toolchain. `vp pack` compiles the public source in `packages/taffyjs-node/src` and emits `index.js` and `index.d.ts`, including public types and JSDoc. The private napi-rs loader and declarations are generated separately and packaged beside that output.

`tools/api-codegen` owns source generation that must keep Rust and TypeScript API facts aligned. Its first maintained input is `api/numeric-families.json`; `vp run codegen` updates both language outputs. CI runs `vp run check:codegen`, which regenerates and rejects any resulting Git diff.

CI uses Node.js 22.18.0. Ubuntu x64 runs the complete verification flow; Windows x64 verifies the native build. macOS and publication workflows are not configured.

## Task orchestration

The root `vite.config.ts` defines build and verification dependencies. Native build completion precedes package-local and consumer tests. Generated-source drift is checked separately in CI and is not part of the default local `check` or `ready` graph.

Task caching is disabled at the root. This keeps native artifacts and runtime tests from being skipped or restored from stale task outputs until the project makes a new explicit caching decision.

The corresponding rulings are recorded in [tooling decisions](tooling-decisions.md).
