# Technology Stack

## Native bindings and distribution

napi-rs owns the Rust-to-Node boundary, private native declarations, native loader, target-specific package metadata, and native release artifact flow. @taffyjs/node passes `--esm` to the napi-rs build rather than transforming the generated loader into another module format.

The generated ESM loader is publishable output inside @taffyjs/node but is not the supported public entry. It uses Node.js createRequire internally because native `.node` files and target packages are loaded through the CommonJS loader, exposes static ESM exports, and has no top-level await. The authored public wrapper imports that loader privately and does not re-export its raw operations.

The maintained napi-rs distribution model uses one root loader package with exact-version optional packages for each target. In this repository the root is @taffyjs/node and the target packages are named @taffyjs/binding-<platform> through `napi.packageName`.

The bigint NodeId, its private TypeScript phantom marker, and its JavaScript validity registry require an authored public wrapper, but they do not require a custom native loader or another npm package. Additional runtimes or custom fallback logic may still require a separate loader decision later.

## JavaScript package builds

Vite+ is the repository's JavaScript toolchain. Authored JavaScript or TypeScript libraries use `vp pack`, which provides the tsdown-based library build through Vite+; the repository does not add a direct tsdown dependency or a separate tsdown configuration.

The authored @taffyjs/node public layer uses `vp pack`. Its public `index.d.ts` is maintained as authored package source because it carries the supported API's detailed readonly shapes and JSDoc; `vp pack` does not replace it with declarations inferred from the private native boundary. The napi-rs-generated loader is not transformed by `vp pack`; it remains an explicit private module whose native artifact paths belong to napi-rs and is packaged alongside the authored output.

## Task orchestration

The root vite.config.ts defines the repository verification graph with explicit build and test dependencies. Native build completion precedes package-local and consumer integration tests, while formatting, linting, and Rust checks can run in parallel.

Task caching is disabled at the root. This keeps native artifacts and runtime tests from being skipped or restored from stale task outputs until the project makes a new explicit caching decision.

The corresponding rulings are recorded in [tooling decisions](tooling-decisions.md).
