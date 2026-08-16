# TaffyJS

TaffyJS brings the Taffy layout engine to JavaScript through native, WebAssembly, and Yoga-compatible packages.

## Features

- **Direct binding to Taffy:** Preserves Taffy's behavior without adding another layout abstraction or mental model.
- **Optimized binding bridge:** Minimizes cross-boundary data transfer with targeted tree operations that update only the relevant state.
- **Native performance:** Runs Taffy as native Rust code in Node.js through Node-API.
- **WebAssembly support:** Runs Taffy in bundled browsers and deployments where a native addon is not the right fit.
- **One API, two runtimes:** The same JavaScript API, backed by native code in `@taffyjs/node` for performance or WebAssembly in `@taffyjs/wasm` for flexibility.
- **Yoga compatibility:** Use `@taffyjs/yoga` or `@taffyjs/yoga-wasm` (work in progress) while preserving Yoga's API shape for straightforward migration.

## Installation

```sh
npm install @taffyjs/node
```

## Packages

| Package                                                                  | Description                                     | Version |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ------- |
| [`@taffyjs/node`](https://www.npmjs.com/package/@taffyjs/node)           | Native Node.js runtime for maximum performance. | —       |
| [`@taffyjs/wasm`](https://www.npmjs.com/package/@taffyjs/wasm)           | WebAssembly runtime for flexible deployment.    | —       |
| [`@taffyjs/yoga`](https://www.npmjs.com/package/@taffyjs/yoga)           | Yoga-compatible API backed by `@taffyjs/node`.  | —       |
| [`@taffyjs/yoga-wasm`](https://www.npmjs.com/package/@taffyjs/yoga-wasm) | Yoga-compatible API backed by `@taffyjs/wasm`.  | WIP     |

## Runtime compatibility

TaffyJS supports Node.js 22.18+, Bun 1.2+ within the Bun 1 major, and Deno 2.2+ within the Deno 2 major. CI runs the complete test suite on Node.js 22.18.0 and smoke-tests Bun 1.2.0 and Deno 2.2.0 by importing each implemented public package, computing a minimal layout, and verifying the result. Bun and Deno support follows one current major per runtime rather than spanning runtime majors.

| Package              | Node.js 22.18+     | Bun 1.2+           | Deno 2.2+                                                                   |
| -------------------- | ------------------ | ------------------ | --------------------------------------------------------------------------- |
| `@taffyjs/node`      | ✅                 | ✅                 | ✅ (local `node_modules`; `--allow-env`, `--allow-read`, and `--allow-ffi`) |
| `@taffyjs/wasm`      | ✅                 | ✅                 | ✅ (without permission flags)                                               |
| `@taffyjs/yoga`      | ✅                 | ✅                 | ✅ (local `node_modules`; `--allow-env`, `--allow-read`, and `--allow-ffi`) |
| `@taffyjs/yoga-wasm` | ⚠️ Not implemented | ⚠️ Not implemented | ⚠️ Not implemented                                                          |

## Documentation

- [Guide](apps/website/guide/index.md) explains the shared layout model, layout modes, and text and image measurement.
- [`@taffyjs/node`](apps/website/node/index.md) documents runtime support and the current public API.
- [`@taffyjs/wasm`](apps/website/wasm/index.md) documents WebAssembly setup, supported environments, and differences from the native package.

## Credits

- [Taffy](https://github.com/DioxusLabs/taffy), the layout engine at the core of TaffyJS.
- [napi-rs](https://github.com/napi-rs/napi-rs), the tooling behind the native and WebAssembly bindings.
- [Yoga](https://github.com/react/yoga), the API and compatibility target for the Yoga packages.

## License

MIT
