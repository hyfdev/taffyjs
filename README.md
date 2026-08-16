# TaffyJS

TaffyJS brings the Taffy layout engine to JavaScript through native, WebAssembly, and Yoga-compatible packages.

## Features

- A direct binding to Taffy's behavior, without another layout abstraction or a new mental model.
- JavaScript-friendly inputs and readable outputs, with APIs optimized for common usage patterns while preserving Taffy's semantics.
- Native performance on Node.js through Rust and Node-API.
- First-class WebAssembly support for bundled browsers and deployments where a native addon is not the right fit.
- One public API across native and WebAssembly runtimes: use `@taffyjs/node` for native performance on Node.js or `@taffyjs/wasm` for WebAssembly portability; only the underlying implementation changes.
- Yoga compatibility through `@taffyjs/yoga` and `@taffyjs/yoga-wasm` (work in progress), preserving Yoga's API shape for straightforward migration.

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
