# TaffyJS

TaffyJS provides JavaScript bindings and compatibility layers for the Taffy layout engine.

The first package is `@taffyjs/node`, the native Node-API entry point built with napi-rs. A future `@taffyjs/node-yoga` package may provide a Yoga-compatible API on top of `@taffyjs/node` without adding another native binding.

The binding API and release target matrix are intentionally left open during repository bootstrap.

## Repository layout

- `crates/` contains Rust crates. The repository starts with one native adapter in `crates/taffyjs_binding`; shared Rust crates should only be extracted when another native consumer needs them.
- `packages/` contains independent JavaScript package boundaries. `packages/taffyjs-node` owns the JavaScript loader, generated types, rare package-local unit tests, and npm metadata for `@taffyjs/node`.
- `tests/` contains private consumer packages for integration and end-to-end coverage. `tests/taffyjs-node` exercises `@taffyjs/node` through the same package boundary used by downstream JavaScript consumers.

Platform-specific native packages use the `@taffyjs/binding-<platform>` naming scheme while `@taffyjs/node` remains the public entry point.

## Development

Install dependencies with `vp install`, then run `vp run ready` to format-check, lint, build the native addon, and run the JavaScript integration tests.
