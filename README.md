# TaffyJS

TaffyJS provides JavaScript bindings and compatibility layers for the Taffy layout engine.

The first package is `@taffyjs/node`, the ESM-only native Node-API entry point built with napi-rs. A future `@taffyjs/node-yoga` package may provide a Yoga-compatible API on top of `@taffyjs/node` without adding another native binding.

The binding API and release target matrix are intentionally left open during repository bootstrap.

## Repository layout

- `crates/` contains Rust crates. The repository starts with one native adapter in `crates/taffyjs_binding`; shared Rust crates should only be extracted when another native consumer needs them.
- `packages/` contains independent JavaScript package boundaries. `packages/taffyjs-node` owns the authored public ESM wrapper and types, the private generated native loader, rare package-local unit tests, and npm metadata for `@taffyjs/node`.
- `tests/` contains private consumer packages for integration and end-to-end coverage. `tests/taffyjs-node` exercises `@taffyjs/node` through the same package boundary used by downstream JavaScript consumers.

Platform-specific native packages use the `@taffyjs/binding-<platform>` naming scheme as unsupported implementation dependencies. `@taffyjs/node` is the public entry point and loads the selected platform package through its private napi-rs loader.

## Development

Install dependencies with `vp install`, then run `vp run ready` to execute the uncached Vite+ task graph for formatting, linting, Rust checks, native build, and JavaScript tests. The authored @taffyjs/node public layer and other authored JavaScript or TypeScript libraries use `vp pack`; the napi-rs-generated native loader remains a separate packaged module and is not repacked.
