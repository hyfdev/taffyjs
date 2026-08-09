# Technology Stack

## Native bindings and distribution

napi-rs owns the Rust-to-Node boundary, generated TypeScript declarations, native loader, target-specific package metadata, and native release artifact flow. @taffyjs/node passes `--esm` to the napi-rs build rather than transforming the generated loader into another module format.

The generated ESM loader is publishable output. It uses Node.js createRequire internally because native `.node` files and target packages are loaded through the CommonJS loader, but it exposes static ESM exports and has no top-level await.

The maintained napi-rs distribution model uses one root loader package with exact-version optional packages for each target. In this repository the root is @taffyjs/node and the target packages are named @taffyjs/binding-<platform> through `napi.packageName`.

A package that needs a larger authored API, additional runtimes, or custom fallback logic may need its own loader build. @taffyjs/node currently exposes the binding directly and does not have those requirements.

## JavaScript package builds

Vite+ is the repository's JavaScript toolchain. Authored JavaScript or TypeScript libraries use `vp pack`, which provides the tsdown-based library build through Vite+; the repository does not add a direct tsdown dependency or a separate tsdown configuration.

The napi-rs-generated @taffyjs/node loader is not passed through `vp pack` because it is already the distributable output and its native artifact paths belong to napi-rs. If @taffyjs/node later gains authored JavaScript or TypeScript source, that authored layer uses `vp pack` while the generated native-loader boundary remains explicit.

## Task orchestration

The root vite.config.ts defines the repository verification graph with explicit build and test dependencies. Native build completion precedes package-local and consumer integration tests, while formatting, linting, and Rust checks can run in parallel.

Task caching is disabled at the root. This keeps native artifacts and runtime tests from being skipped or restored from stale task outputs until the project makes a new explicit caching decision.

The corresponding rulings are recorded in [tooling decisions](tooling-decisions.md).
