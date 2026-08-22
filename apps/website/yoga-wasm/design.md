# Design

`@taffyjs/yoga-wasm` exists because two choices are independent: the API an application uses and the runtime that executes Taffy.

|                        | Native Rust     | WebAssembly          |
| ---------------------- | --------------- | -------------------- |
| Direct TaffyJS API     | `@taffyjs/node` | `@taffyjs/wasm`      |
| Yoga-compatible facade | `@taffyjs/yoga` | `@taffyjs/yoga-wasm` |

Keeping those choices separate is what makes the fourth package small.

## Reuse the compatibility layer

`@taffyjs/yoga-wasm` builds the exact facade source owned by `@taffyjs/yoga`. During the build, exact `@taffyjs/node` backend imports are redirected to `@taffyjs/wasm`. There is no copied Yoga facade and no second list of compatibility decisions.

This means that changing the backend cannot suddenly make an unsupported Yoga feature meaningful. The same Yoga 3.2.1 classifications, declaration rules, input translation, lifetime checks, and output projection apply on both runtimes.

## Make drift fail during development

Sharing source removes one common cause of drift, but it is not the only check. The complete Yoga behavior and declaration suites run again through the Wasm package. Package checks also reject native backend references in the emitted runtime or a second embedded Wasm payload.

The goal is not to promise that native code and WebAssembly fail identically at their lowest level. For example, an unexpected Rust panic has a different runtime boundary in Wasm. The goal is to keep the supported Yoga-facing contract the same and make accidental package divergence visible before release.

## Keep Wasm loading in `@taffyjs/wasm`

The root entry creates the usual eager Yoga facade. The `/load` entry preserves Yoga's `loadYoga()` shape and defers importing the facade, so a browser does not compile WebAssembly until the application asks for it.

Everything else belongs to an existing package: Yoga compatibility stays in the shared facade, and WebAssembly loading stays in `@taffyjs/wasm`. `@taffyjs/yoga-wasm` owns only the connection between them. That narrow responsibility is the design, not a temporary lack of features.
