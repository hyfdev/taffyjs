# @taffyjs/wasm Package Design

## Outcome

`@taffyjs/wasm` is the explicit distribution for consumers that want TaffyJS to run as WebAssembly in both Node.js and browsers. A consumer chooses it by importing that package; it is not an automatic fallback for `@taffyjs/node`, and installing `@taffyjs/node` must not download its Wasm binary.

The package reuses the public API and authored JavaScript behavior of `@taffyjs/node`. It does not define a second Taffy API, expose the raw napi-rs binding, or maintain a second copy of the `TaffyTree` source. The same authored source is compiled against a different private binding at build time.

## Public use

Node.js, Bun 1.2+ within major 1, Deno 2.2+ within major 2, and browser applications use the same ESM import and receive an initialized API:

```ts
import { TaffyTree } from "@taffyjs/wasm";

const tree = new TaffyTree();
```

There is no public `init()`, `loadTaffy()`, `/load`, or other package-specific initialization API. Consumers that want lazy loading use the platform mechanism, `await import("@taffyjs/wasm")`.

The package is ESM-only, matching `@taffyjs/node`. A dedicated public CommonJS build is outside this design.

## Artifact and package layout

The package contains the threadless `wasm32-wasip1` artifact as one raw base64 string in a generated private JavaScript module. The npm tarball does not contain an independent `.wasm` file. Base64 increases the uncompressed payload size, but avoiding a separate binary asset is more important for this package and ordinary package compression still applies during transfer.

The base64 payload occurs exactly once in the package, even though the package retains browser and default public entries. The private Node and browser ESM adapters both import that generated no-TLA ESM payload module normally. The generated scoped target package such as `@taffyjs/binding-wasm32-wasip1` is a build-only staging artifact and an explicit exception to the normal scope boundary. It is not a public dependency or separately published TaffyJS package: the generator matches the napi-rs file-loading fallback as source text and removes that complete `require.resolve` branch when it inlines the artifact.

The package root uses conditional exports with one declaration surface, a browser entry, and a default Node.js entry. The intended shape is:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "browser": "./dist/index.browser.js",
      "default": "./dist/index.js"
    }
  }
}
```

Exact output extensions and directories may follow the repository's Vite+ conventions without reopening this design. The observable requirements are one package root, browser/default selection, one public declaration surface, and one textually inlined Wasm payload.

## Runtime chains

The default entry used by Node.js, Bun, and Deno connects the existing authored TaffyJS source to a private ESM bridge and a generated CommonJS factory. The bridge statically imports the shared payload and immediately calls that factory. The factory is mechanically derived from napi-rs's generated eager Node loader: it decodes the supplied payload with `Buffer.from`, uses `instantiateNapiModuleSync`, and retains the generated registration, rollback, cleanup, and binding-export lifecycle. The selected graph has no top-level await, so ordinary static imports expose an initialized `TaffyTree` without making consumers await package initialization. Deno uses this package without runtime permission flags.

The browser entry connects the same authored source to a private ESM adapter. That adapter decodes the shared payload with `Uint8Array.fromBase64` when available and otherwise uses `atob` plus a direct `Uint8Array` fill, calls `WebAssembly.compile` exactly once, and passes the resulting `WebAssembly.Module` to napi-rs's unmodified deferred loader through `instantiate(module)`. It uses top-level await, so browser static importers run only after initialization and still use `new TaffyTree()` without an explicit initialization call.

Consumers that need control over when loading occurs use `await import("@taffyjs/wasm")`; the package does not expose a parallel initialization protocol. The primary browser consumption path is through a bundler that honors the `browser` export condition, supports top-level await, and includes the shared base64 module in JavaScript rather than emitting a `.wasm` asset. The package does not add gzip, data URLs, `fetch`, `Blob`, `Response`, or an extra copied `ArrayBuffer` to either chain.

Static and dynamic imports use the host's ordinary module cache. The synchronous Node adapter relies on CommonJS caching and the generated eager-loader lifecycle; the official deferred browser loader owns its module-local instance cache. TaffyJS does not add another retry state machine or disposal API.

## Source and maintenance ownership

The existing authored source under `packages/taffyjs-node/src` remains the single source for `TaffyTree`, NodeId validation, JavaScript-owned context, public helpers, types, and declarations. The Wasm package build compiles that source twice and redirects only its private raw-binding import to the matching generated Node or browser adapter. This is build wiring, not a new public runtime wrapper or a second implementation of Taffy behavior.

napi-rs owns the source behavior of the eager Node and deferred browser loaders: WASI and emnapi setup, WebAssembly instantiation, memory plumbing, cleanup behavior, and raw binding exports. TaffyJS publishes the deferred loader unchanged. For Node, TaffyJS owns a strict build-time transformation of the freshly generated eager loader: exact-match assertions wrap its eager body as a synchronous factory, replace only its Node filesystem input, native `node:wasi` construction, file-path rollback key, and final CommonJS export with an input parameter, the JavaScript WASI runtime, and a returned binding. Any upstream template drift makes the build fail instead of silently maintaining a fork. TaffyJS does not hand-maintain or reimplement the remaining lifecycle code.

TaffyJS also owns its existing authored public source, `@taffyjs/wasm` package metadata, conditional exports, build-time binding redirection, the typed package-specific generator under `tools/taffy-wasm`, the generated payload and small private adapters, official runtime dependency declarations, and package-level tests. Generated package files must not be hand-edited.

Both runtime chains use napi-rs's JavaScript WASI implementation without forwarding `process.env`, preopening the filesystem root, or importing `node:wasi`; neither requires `SharedArrayBuffer`. The generated eager Node loader's pinned default initial memory is 4,000 Wasm pages (250 MiB), while the deferred browser loader's pinned default is 1,024 pages (64 MiB); this design preserves both upstream defaults. Changing runtime defaults, expanding the mechanical transformation, or implementing WASI and emnapi behavior locally requires an explicit reopening of this boundary.

## Non-goals

- Do not add automatic native-to-Wasm fallback to `@taffyjs/node`.
- Do not publish or ask users to install a TaffyJS WASIP binding package.
- Do not add a public initialization API, public raw binding, hand-maintained WASI or emnapi implementation, or Wasm-specific Taffy API.
- Do not use wasm-bindgen, a second Rust binding implementation, a second authored `TaffyTree`, gzip, `wasm-opt`, or a threaded WASIP target.
- Do not claim support below the documented Bun or Deno minor floors, across Bun or Deno majors, for workerd, for unbundled CDN use, or for legacy browsers without separate evidence and a deliberate support decision.

## Verification contract

- A Node.js ESM consumer must import `@taffyjs/wasm` and use the ordinary public Taffy API without initialization calls, top-level await in the selected package graph, or native platform packages.
- Consumers on Bun 1.2+ within major 1 and Deno 2.2+ within major 2 must import the same public entry and complete a minimal layout through the ordinary API; the Deno check must run without permission flags. CI covers only Bun 1.2.0 and Deno 2.2.0 as the first releases of the supported minor floors and does not retain a cross-major runtime matrix.
- A bundled browser consumer must use the same import and API, include the inline payload without emitting a `.wasm` asset, and work without `SharedArrayBuffer`, cross-origin isolation, COOP, or COEP.
- The Node and browser builds must derive their JavaScript and TypeScript surface from the same authored source. Except for a documented and evidenced host-specific exception, every public Node binding behavior test must run unchanged against both `@taffyjs/node` and `@taffyjs/wasm`; one test configuration redirects the exact package import instead of copying test files.
- Package inspection must show exactly one base64 Wasm payload, no independent `.wasm` file, exactly one browser-side `WebAssembly.compile`, synchronous `instantiateNapiModuleSync` in the Node graph, no Node environment or filesystem-root WASI capabilities, no retained `require.resolve` or dependency on `@taffyjs/binding-wasm32-wasip1`, no public initialization subpath, and no accidentally published raw binding entry.
- Generated napi-rs artifacts and all derived package modules must be reproducible from the pinned toolchain and repository generator. The napi-rs deferred loader must not contain maintained TaffyJS edits, and the Node adapter transformation must reject unexpected upstream template changes.

## Evidence

- [napi-rs CLI 3.8.2 WASI target and loader documentation](https://github.com/napi-rs/napi-rs/blob/5b344c367eeed81d1917f7c4d8e65b1adc16de12/cli/docs/wasi.md) identifies `wasm32-wasip1` as threadless and documents the generated eager browser, Node, and deferred loader roles.
- [napi-rs CLI 3.8.2 loader templates](https://github.com/napi-rs/napi-rs/blob/5b344c367eeed81d1917f7c4d8e65b1adc16de12/cli/src/api/templates/load-wasi-template.ts) are the pinned source of the generated runtime behavior consumed by this design.
- [Rolldown browser package exports at ce98ae7](https://github.com/rolldown/rolldown/blob/ce98ae79804283ab7f99a814c9c157cdb0ea5ea2/packages/browser/package.json) demonstrate browser/default entries in one explicit Wasm package, while [its build wiring](https://github.com/rolldown/rolldown/blob/ce98ae79804283ab7f99a814c9c157cdb0ea5ea2/packages/rolldown/build.ts) compiles the same authored source against generated Node and browser WASI loaders.
