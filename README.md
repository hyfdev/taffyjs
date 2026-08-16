# TaffyJS

TaffyJS brings the Taffy layout engine to JavaScript through native, WebAssembly, and Yoga-compatible packages.

## Features

- **Direct binding to Taffy:** Preserves Taffy's behavior without adding another layout abstraction or mental model.
- **Optimized binding bridge:** Minimizes cross-boundary data transfer with targeted tree operations that update only the relevant state.
- **Native performance:** Runs Taffy as native Rust code in Node.js through Node-API.
- **WebAssembly support:** Runs Taffy in bundled browsers and deployments where a native addon is not the right fit.
- **One API, two runtimes:** Switch freely between `@taffyjs/node` and `@taffyjs/wasm` for native performance or WebAssembly flexibility—their public APIs are identical.
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

## Credits

- [Taffy](https://github.com/DioxusLabs/taffy), the layout engine at the core of TaffyJS.
- [napi-rs](https://github.com/napi-rs/napi-rs), the tooling behind the native and WebAssembly bindings.
- [Yoga](https://github.com/react/yoga), the API and compatibility target for the Yoga packages.

## License

MIT
