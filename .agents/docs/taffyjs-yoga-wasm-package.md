# @taffyjs/yoga-wasm Package Design

`@taffyjs/yoga-wasm` is the separate Wasm transport for the Yoga 3.2.1 compatibility facade. It builds the authored source owned by `packages/taffyjs-yoga/src` against the public `@taffyjs/wasm` API and does not copy, fork, or independently evolve the facade.

## Public contract

- The package is ESM-only and exposes the same root and `/load` shapes, declarations, constants, and Yoga compatibility classifications as `@taffyjs/yoga`.
- The package supports Node.js `>=22.18` and modern bundled browsers within the existing `@taffyjs/wasm` contract. It does not claim direct CDN, legacy-browser, Bun, Deno, workerd, or other edge-runtime support without separate evidence.
- Consumers may install it under Yoga's original name with the registry alias `"yoga-layout": "npm:@taffyjs/yoga-wasm@<version>"`; supported application imports remain unchanged.
- `PositionType.Static` and every other Unsupported capability stay unsupported. Replacing the runtime transport does not create missing Taffy layout semantics.

## Source and package boundary

`packages/taffyjs-yoga-wasm` has no facade source. Its Vite+ entries point to the sibling Yoga package's `src/index.ts` and `src/load.ts`; a filtered resolver replaces only the exact bare `@taffyjs/node` import with an external bare `@taffyjs/wasm` import. The emitted Yoga artifact is otherwise host-neutral.

The package has one runtime dependency, `@taffyjs/wasm`. It must not depend on `@taffyjs/yoga` or `@taffyjs/node`, which would pull the native package into the Wasm transport. It does not embed another Wasm payload: the consuming tool resolves `@taffyjs/wasm` and owns selection and bundling of that package's default or browser graph.

`packages/taffyjs-yoga-wasm/dist` is ignored build output, matching the direct Wasm and native Yoga packages. Every Yoga Wasm verification branch builds it before inspecting declarations, package contents, tarballs, or runtime behavior; publication must likewise build first.

The declaration bundle uses the tsconfig located beside the shared Yoga source. With the pinned TypeScript 7 and declaration generator, placing that tsconfig under the Yoga Wasm package makes the generator treat the wrong directory as `rootDir`, fail with TS6059, and potentially leave declarations beside the shared source. Clean builds and package checks therefore require the sibling Yoga tsconfig and reject any `.d.ts` written under `packages/taffyjs-yoga/src`.

## Loading and facade ownership

The root entry imports the facade normally and creates one eager Yoga object. The `/load` entry exports enums and types without statically importing the facade; `loadYoga()` dynamically imports it and then calls `createYoga()`. In a browser, WebAssembly compilation therefore begins only when `loadYoga()` is called.

JavaScript module caching means repeated `loadYoga()` calls share the loaded `@taffyjs/wasm` module and its memory. Each call still creates a separate logical facade, hidden `TaffyTree`, Node and Config registry, and object brand. Cross-facade handles are rejected before reaching Taffy.

## Failure boundary

Expected validation, callback, and Taffy errors retain the compatibility facade's retry and state-commit rules. Unexpected Rust panics inherit `@taffyjs/wasm` behavior: the Wasm module or worker can abort instead of unwinding to JavaScript as the native binding does. The facade must not claim that its JavaScript poisoning path can recover an already aborted Wasm runtime.

## Verification contract

- Build the same Yoga source against `@taffyjs/wasm`, then reject any emitted runtime reference to `@taffyjs/node`, any backend reference in public declarations, a second inline Wasm payload, or declarations written beside the shared source.
- Run the complete maintained Yoga behavior suite unchanged against the Wasm backend, including the subprocess path-selection fixture, and reuse the public declaration test.
- Pack both `@taffyjs/wasm` and `@taffyjs/yoga-wasm`; install the latter under the bare `yoga-layout` dependency name in fresh npm and pnpm consumers; run both Node entries.
- From the installed tarballs, build bare `yoga-layout` and `yoga-layout/load` imports with Vite. Each browser bundle must select the `@taffyjs/wasm` browser condition, contain one inline payload and one `WebAssembly.compile`, emit no `.wasm` asset, and contain no `node:wasi` path.
- Run both installed browser entries in real Chromium without cross-origin isolation or `SharedArrayBuffer`. Importing `/load` must compile zero Wasm modules; the first `loadYoga()` call must compile exactly one.

The Yoga Wasm checks live in the existing Linux-only `check:wasm` graph because they require the WASIP Rust target and Chromium. Native cross-platform checks continue to own `@taffyjs/yoga`.
