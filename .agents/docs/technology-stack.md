# Technology Stack

## Native bindings and distribution

napi-rs owns the Rust-to-Node boundary, private native declarations, native loader, and target-specific package metadata. It generates an ESM loader, which Vite+ bundles into the ESM public entry without maintaining a custom loader.

The generated ESM loader is a private build input. The authored wrapper imports it privately, and the bundled public entry does not re-export raw native operations.

The root package has exact-version optional packages for the two supported targets: `@taffyjs/binding-linux-x64-gnu` and `@taffyjs/binding-win32-x64-msvc`. Publication is not configured.

The bigint NodeId marker and its JavaScript validity registry require the authored wrapper, but not a custom loader or another package.

`@taffyjs/wasm` uses the same Rust crate through napi-rs's threadless `wasm32-wasip1` target. The pinned CLI generates eager Node and deferred ESM loaders plus the release Wasm binary in a package-local staging directory. The package build encodes that binary into one generated ESM payload, publishes the deferred loader unchanged, and mechanically derives a synchronous CommonJS factory from the eager loader with exact-match drift assertions. The no-TLA Node ESM bridge imports the payload and immediately calls that factory; the browser adapter imports the same payload directly. Raw binaries and unadapted eager loaders never enter the final output directory, and the generated target package is not published. napi-rs 3.8.2 still requires the staged declaration output passed to `--dts` to use a `.d.cts` filename.

The default Node chain imports the shared payload through its synchronous ESM graph, decodes it with `Buffer.from`, and uses `instantiateNapiModuleSync`; its selected package graph has no top-level await. The browser adapter uses `Uint8Array.fromBase64` or an `atob` fallback, calls `WebAssembly.compile` once, and passes the resulting module to the official deferred loader; top-level await makes an ordinary browser static import fully initialized. Dynamic `import()` is the lazy-loading mechanism on both hosts. Both adapters use the JavaScript WASI runtime and grant no environment or filesystem-root capabilities. TaffyJS keeps the generated loader defaults: 4,000 initial pages (250 MiB) for Node and 1,024 pages (64 MiB) for browsers.

At the current pins, napi-rs 3.8.2 requires emnapi 2.0.0-alpha.3, but its generated target-package metadata asks for `@napi-rs/wasm-runtime ~1.2.3`, whose 1.2.3 peer range accepts emnapi 2.x only from alpha.4. npm then installs a second stable emnapi copy for `wasm-runtime`, and mixing that copy with the loader's direct alpha.3 runtime fails during initialization. The public package pins `@napi-rs/wasm-runtime` 1.2.2 instead: it is the last 1.2.x release whose declared peers accept alpha.3, so the CLI, linked core, generated loader, and runtime use one emnapi version under both npm and pnpm. Packed-consumer tests cover both installation layouts. Upgrade these packages as one generated-toolchain unit rather than independently guessing versions.

## JavaScript package builds

Vite+ is the JavaScript toolchain. `vp pack` compiles the public source in `packages/taffyjs-node/src`, bundles the private napi-rs loader, and emits `index.js` and `index.d.ts`, including public types and JSDoc. The private native declaration remains a generated build input rather than a published file.

The `@taffyjs/wasm` Vite+ pack configuration compiles that same entry twice. A filtered build-time resolver redirects only the resolved private binding import to `./taffyjs.node.js` for Node and `./taffyjs.browser.js` for browsers, leaving those generated adapters external. Both adapters reference `./taffyjs.wasm-base64.js`, so the base64 literal occurs once in the package. The Node compilation emits the one public declaration bundle; the browser compilation does not maintain a second declaration source.

The root Vite+ task graph builds the napi-rs artifacts into `packages/taffyjs-wasm/.napi-build`, runs `vp pack` with `dist` cleanup enabled for the two public entries, then runs `tools/taffy-wasm/generate-inline-wasm-runtime-files.ts`. That typed, package-specific generator validates and base64-encodes the staged release binary, copies the deferred loader unchanged, generates the small host adapters, and transforms the freshly generated eager Node loader only at asserted input and WASI-construction sites. Because only final runtime files are written after `vp pack` cleans `dist`, the build has no separate package-finalization or deletion phase. `dist` is ignored build output: CI, package inspection, and packed-consumer tests build it before use rather than committing compiler output to Git.

`tools/api-codegen` owns source generation that must keep Rust and TypeScript API facts aligned. Its first maintained input is `api/numeric-families.json`; `vp run codegen` updates both language outputs. CI runs `vp run check:codegen`, which regenerates and rejects any resulting Git diff.

CI has five jobs. Ubuntu x64 and Windows x64 each build the native addon and run all Rust, JavaScript, and type tests with Node.js 22.18.0. Ubuntu also rejects stale committed package JavaScript and declarations after the build. A separate Ubuntu WASIP job installs the Rust target and Playwright Chromium, builds `@taffyjs/wasm`, reruns the complete Node public API suite against it, and runs type, package-content, packed-consumer, bundled-consumer, and browser-runtime checks against the generated package. A Node-only job checks formatting, JavaScript and repository TypeScript including maintained tools through Vite+'s type-aware lint path, and generated-source drift. A Rust-only job checks formatting and Clippy. macOS and publication workflows are not configured.

## Task orchestration

The root `vite.config.ts` defines build and verification dependencies. The Wasm build is an explicit three-stage dependency chain—staged napi-rs binding, Vite+ public entries, then final inline runtime files—instead of a compound package script. Native build completion precedes package-local and consumer tests. Rust tests are part of the full test task, while Rust formatting and Clippy remain separate checks. Node formatting and linting do not depend on a native build. Generated-source drift is checked separately in CI and is not part of the default local `check` or `ready` graph.

Task caching is disabled at the root. This keeps native artifacts and runtime tests from being skipped or restored from stale task outputs until the project makes a new explicit caching decision.

`check:wasm` is a separate Linux-capable graph rather than a dependency of the cross-platform default `check:test`: it requires the `wasm32-wasip1` Rust target and a Playwright browser. Its public API, Node smoke, type, packaging, packed-consumer, and browser tasks are sibling nodes after the shared Wasm build, so Vite+ can run them in parallel. Existing native jobs therefore keep their target assumptions while the dedicated WASIP job exercises the complete package boundary.

The corresponding rulings are recorded in [tooling decisions](tooling-decisions.md).
