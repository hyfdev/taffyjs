# Technology Stack

## Native bindings and distribution

napi-rs owns the Rust-to-Node boundary, private native declarations, native loader, and target-specific package metadata. It generates an ESM loader, which Vite+ bundles into the ESM public entry without maintaining a custom loader.

The generated ESM loader is a private build input. The authored wrapper imports it privately, and the bundled public entry does not re-export raw native operations.

The root package has exact-version optional packages for the two supported targets: `@taffyjs/binding-linux-x64-gnu` and `@taffyjs/binding-win32-x64-msvc`. Publication is not configured.

The bigint NodeId marker and its JavaScript validity registry require the authored wrapper, but not a custom loader or another package.

## JavaScript package builds

Vite+ is the JavaScript toolchain. `vp pack` compiles the public source in `packages/taffyjs-node/src`, bundles the private napi-rs loader, and emits `index.js` and `index.d.ts`, including public types and JSDoc. The private native declaration remains a generated build input rather than a published file.

`tools/api-codegen` owns source generation that must keep Rust and TypeScript API facts aligned. Its first maintained input is `api/numeric-families.json`; `vp run codegen` updates both language outputs. CI runs `vp run check:codegen`, which regenerates and rejects any resulting Git diff.

CI has four jobs. Ubuntu x64 and Windows x64 each build the native addon and run all Rust, JavaScript, and type tests with Node.js 22.18.0. Ubuntu also rejects stale committed package JavaScript and declarations after the build. A Node-only job checks formatting, JavaScript and TypeScript, and generated-source drift. A Rust-only job checks formatting and Clippy. macOS and publication workflows are not configured.

## Task orchestration

The root `vite.config.ts` defines build and verification dependencies. Native build completion precedes package-local and consumer tests. Rust tests are part of the full test task, while Rust formatting and Clippy remain separate checks. Node formatting and linting do not depend on a native build. Generated-source drift is checked separately in CI and is not part of the default local `check` or `ready` graph.

Task caching is disabled at the root. This keeps native artifacts and runtime tests from being skipped or restored from stale task outputs until the project makes a new explicit caching decision.

The corresponding rulings are recorded in [tooling decisions](tooling-decisions.md).
