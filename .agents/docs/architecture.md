# Architecture

This repository is a small Rust and JavaScript monorepo with one shared napi-rs binding and four public packages.

## Ownership

- `.agents/` holds durable project intent and decisions that cannot be expressed in code or configuration.
- `crates/taffyjs_binding` owns the napi-rs adapter and depends directly on Taffy. A shared Rust crate is justified only when a second Rust consumer needs it.
- `packages/taffyjs-node` owns the public ESM wrapper and declarations, the private napi-rs loader and declarations, and npm metadata. The wrapper owns JavaScript-only NodeId validity data and context; Taffy owns topology, Style, Layout, cache, and computation state.
- `packages/taffyjs-wasm` compiles the same authored source from `packages/taffyjs-node/src` against generated private Node and browser adapters that share one inline payload. It owns package metadata, generated artifacts, and build-time binding redirection; its package-specific typed generator lives under `tools/taffy-wasm`. It has no authored public wrapper source or separate initialization API.
- `packages/taffyjs-yoga` owns the Node-only ESM Yoga 3.2.1 compatibility facade, Yoga declarations and visible state, input translation, and Yoga-shaped output projection. It depends only on the public `@taffyjs/node` package boundary and does not modify Taffy or the native binding.
- `packages/taffyjs-yoga-wasm` builds the exact facade source owned by `packages/taffyjs-yoga/src` against the public `@taffyjs/wasm` backend. It owns only its package metadata and build-time backend redirection; it has no copied facade source or second compatibility policy.
- `tests/taffyjs-node` is a private consumer package that tests `@taffyjs/node` through its package boundary.
- `tests/taffyjs-wasm` is a private consumer package that checks the Wasm package through Node and browser package resolution, reuses the existing public type tests, mechanically inspects the published file set, and installs the packed result in fresh npm and pnpm consumers.
- `tests/taffyjs-yoga` is the corresponding private consumer package for compatibility, differential, and end-to-end tests through the `@taffyjs/yoga` package boundary; it does not contain a redundant nested `tests/` directory.
- `tests/taffyjs-yoga-wasm` reruns the same Yoga behavior and declaration suites against the Wasm transport, inspects the package boundary, and installs the packed packages in fresh npm and pnpm consumers for Node and Chromium checks.

The `@taffyjs/node` public entry bundles the private napi-rs root loader, which selects the matching optional platform package. Its generated loader and declaration remain repository build inputs rather than published package files. The `@taffyjs/wasm` default entry reaches a no-TLA ESM bridge that imports the shared payload and immediately invokes a synchronous CommonJS factory mechanically derived from napi-rs's eager Node loader; its browser entry reaches a TLA adapter and the unmodified deferred loader. Neither direct runtime package exposes an intermediate binding package, JavaScript shadow tree, separate core crate, public binding, or public initialization API.

`@taffyjs/yoga` is a Node-only TypeScript compatibility layer over `@taffyjs/node`; browser and WASM backends never live in that package. It performs bounded input normalization and output processing, but it does not modify or fork Taffy core, add a Yoga-specific native algorithm, or reimplement Flex layout in JavaScript; behavior that cannot cross that boundary is documented as Different or Unsupported as recorded in [@taffyjs/yoga decisions](taffyjs-yoga-decisions.md).

`@taffyjs/yoga-wasm` is a separate transport over `@taffyjs/wasm`, selected at build time by replacing only the exact bare `@taffyjs/node` dependency. The eager root entry and lazy `/load` entry keep Yoga's public shapes; `/load` dynamically imports the facade so a browser compiles no WebAssembly until `loadYoga()` is called. Compatibility semantics stay owned by the shared Yoga source and documentation.

## Testing

JavaScript integration tests are the primary proof of observable behavior. Package-local JavaScript and Rust unit tests are limited to critical behavior that is clearer in isolation. Maintained test names follow product behavior rather than temporary milestone or acceptance labels.

The Wasm package runs the complete Node public API behavior suite without copied test files: a Wasm-only Vite+ configuration replaces the exact `@taffyjs/node` import with `@taffyjs/wasm`. Subprocess fixtures select the same test entry through an inherited test-only file URL. The Wasm package additionally has a real Chromium runtime test through Vite+ and Playwright. A separate Vite consumer build proves that the `browser` export is selected, the payload occurs once in JavaScript, and no external `.wasm` asset is emitted; the browser runtime check exercises synchronous measurement and reuse after a controlled error without cross-origin isolation or `SharedArrayBuffer`.

The Yoga Wasm package likewise reuses the complete maintained Yoga suite and public declaration test. Its packed-consumer fixture proves unchanged `yoga-layout` root and `/load` imports in Node and bundled Chromium, including the lazy compilation boundary, rather than maintaining a second copy of compatibility tests.

A test earns its place only when it is the clearest durable check for a distinct observable behavior or safety property. Before adding one, identify the exact failure it would catch and explain why tests beside the code that owns the behavior would not already catch it. Distinct coverage is not enough: the protection must justify the code to maintain, time to run, ways it can fail for unrelated reasons, and platform-specific behavior it introduces. Prefer the smallest direct check. When consolidating duplicate files, move any genuinely unique assertion into the owning test before deleting the duplicate.

Review test changes in this order: whether the protection is worth its cost, whether the check sits beside the right code, then whether its implementation is correct. A passing test or a working harness proves only that it runs. Do not use runtime tests that read README, source, or test files as a substitute for testing product behavior or enforcing architecture. If an explicit repository rule needs automatic enforcement, such as which module may import a private loader, use a focused lint or CI check against the source files. Generated-artifact freshness follows [API code generation](api-codegen.md#verification), not generator unit tests.

Documentation examples are test subjects only when the project has already committed to supporting them as executable artifacts independently of the proposed test harness. Adding markers, extraction code, temporary projects, or child processes does not create that commitment. Otherwise keep examples as documentation and test their APIs and behavior through normal type and integration tests.

Separate-process fixtures are justified only when the process mode or containment is part of the behavior, such as enabling forced garbage collection or isolating a possible native deadlock, panic, or abort. This rule is recorded because an earlier review checked whether several elaborate tests worked before asking whether their small extra protection justified their complexity. Future reviews must make that value judgment first.

## Read boundary

Style, Layout, detailed Grid data, child arrays, and measure arguments cross the boundary as complete detached values. Binding-produced records are recursively readonly in TypeScript but remain ordinary mutable objects at runtime. No live Rust borrow, native-backed view, cache, lazy property, selector, prepared query, or batch snapshot is part of the current API.

Only a real consumer workload and complete measurements can justify another read path; that work is tracked in [API alignment TODOs](api-alignment-todos.md).
