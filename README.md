# TaffyJS

TaffyJS provides JavaScript bindings and compatibility layers for the Taffy layout engine.

The first package is `@taffyjs/node`, the ESM-only native Node-API entry point built with napi-rs. A future `@taffyjs/node-yoga` package may provide a Yoga-compatible API on top of `@taffyjs/node` without adding another native binding.

The current package implements Taffy 0.13 for Linux x64 GNU and Windows x64 MSVC with Node.js 22.18.0 or newer. Publication is not configured.

## Repository layout

- `crates/` contains Rust crates. The repository starts with one native adapter in `crates/taffyjs_binding`; shared Rust crates should only be extracted when another native consumer needs them.
- `packages/` contains independent JavaScript package boundaries. `packages/taffyjs-node` owns the authored public ESM wrapper and types, the private generated native loader, rare package-local unit tests, and npm metadata for `@taffyjs/node`.
- `tests/` contains private consumer packages for integration and end-to-end coverage. `tests/taffyjs-node` exercises `@taffyjs/node` through the same package boundary used by downstream JavaScript consumers.

The two native packages are `@taffyjs/binding-linux-x64-gnu` and `@taffyjs/binding-win32-x64-msvc`. They are private implementation dependencies; application code imports only `@taffyjs/node`.

## Development

Install dependencies with `vp install`, then run `vp run --concurrency-limit 1 ready` for generated-source drift, formatting, linting, Rust checks, the native build, type checks, JavaScript tests, and the packed-consumer check. After changing an input under `api/`, run `vp run codegen`; normal builds never rewrite source. The public `@taffyjs/node` TypeScript source is built with `vp pack`; napi-rs generates the private native loader separately.
