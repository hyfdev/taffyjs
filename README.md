# TaffyJS

TaffyJS brings the Taffy layout engine to JavaScript through native, WebAssembly, and Yoga-compatible packages.

## Features

- **Direct binding to Taffy:** Preserves Taffy's behavior without adding another layout abstraction or mental model.
- **Optimized binding bridge:** Minimizes cross-boundary data transfer with targeted tree operations that update only the relevant state.
- **Native performance:** Runs Taffy as native Rust code in Node.js through Node-API.
- **WebAssembly support:** Runs Taffy in bundled browsers and deployments where a native addon is not the right fit.
- **One API, two runtimes:** Use `@taffyjs/node` for native performance on Node.js or `@taffyjs/wasm` for WebAssembly portability; only the underlying implementation changes.
- **Yoga compatibility:** Use `@taffyjs/yoga` or `@taffyjs/yoga-wasm` (work in progress) while preserving Yoga's API shape for straightforward migration.

## Installation

```sh
npm install @taffyjs/node
```

## Packages

| Package                                                                  | Version |
| ------------------------------------------------------------------------ | ------- |
| [`@taffyjs/node`](https://www.npmjs.com/package/@taffyjs/node)           | —       |
| [`@taffyjs/wasm`](https://www.npmjs.com/package/@taffyjs/wasm)           | —       |
| [`@taffyjs/yoga`](https://www.npmjs.com/package/@taffyjs/yoga)           | —       |
| [`@taffyjs/yoga-wasm`](https://www.npmjs.com/package/@taffyjs/yoga-wasm) | WIP     |

## Credits

- [Taffy](https://github.com/DioxusLabs/taffy), the layout engine at the core of TaffyJS.
- [napi-rs](https://github.com/napi-rs/napi-rs), the tooling behind the native and WebAssembly bindings.
- [Yoga](https://github.com/react/yoga), the API and compatibility target for the Yoga packages.

## License

MIT
