# `@taffyjs/wasm`

`@taffyjs/wasm` runs the same TaffyJS API through WebAssembly, over Taffy at revision [`77f38568`](https://github.com/DioxusLabs/taffy/commit/77f385683c1d698c91a23a259f87fdddf26925fb). Choose it for a bundled browser application, or when you want to use WebAssembly explicitly in Node.js instead of loading a native addon.

Read the [Design](./design.md) to understand how the package keeps one direct API across native and WebAssembly runtimes.

## Install

```sh
npm install @taffyjs/wasm
```

Import it like the native package. There is no separate initialization call:

```ts
import { TaffyTree } from "@taffyjs/wasm";

const tree = new TaffyTree();
const root = tree.newLeaf({ size: { width: 120, height: 80 } });

tree.computeLayout({
  root,
  availableSpace: { width: 800, height: 600 },
});

console.log(tree.getLayout(root).size); // { width: 120, height: 80 }
```

The [Guide](../guide/getting-started.md) and [`TaffyTree` reference](../node/nodes-and-topology.md) use `@taffyjs/node`, but the tree, style, measurement, and layout APIs shown there also apply to `@taffyjs/wasm`. Change the package name in the import; the rest of the code stays the same.

## Where it runs

| Environment | Support                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| Node.js     | Node.js 22.20 or newer                                                                        |
| Bun         | Version 1.2 or newer within the Bun 1 major                                                   |
| Deno        | Version 2.2 or newer within the Deno 2 major, without permission flags                        |
| Browser     | Applications built with a bundler that supports package export conditions and top-level await |

The browser build contains the Wasm payload inside JavaScript, so it does not fetch a separate `.wasm` file. It is threadless and does not require `SharedArrayBuffer` or cross-origin isolation headers.

Bun versions below 1.2, Deno versions below 2.2, other Bun and Deno majors, direct CDN imports, and runtimes not listed above are not part of the package contract.

## Loading

A normal static import is ready to use when the module finishes loading. In a browser, the module waits for WebAssembly compilation as part of loading:

```ts
import { TaffyTree } from "@taffyjs/wasm";
```

If the layout engine is not needed at startup, use a standard dynamic import:

```ts
const { TaffyTree } = await import("@taffyjs/wasm");
```

Your bundler must select the package's browser entry. No TaffyJS-specific loader or initialization function is required.

## Compared with `@taffyjs/node`

|                                 | `@taffyjs/node`                  | `@taffyjs/wasm`                          |
| ------------------------------- | -------------------------------- | ---------------------------------------- |
| Engine                          | Taffy compiled as a native addon | Taffy compiled to threadless WebAssembly |
| Main use                        | Supported native platforms       | Bundled browsers and supported runtimes  |
| Public layout API               | Direct TaffyJS API               | The same direct TaffyJS API              |
| Initialization visible to users | None                             | None                                     |
| Distribution                    | Platform-specific native binary  | Wasm payload embedded in JavaScript      |

The package choice is explicit. `@taffyjs/node` does not silently fall back to WebAssembly, and `@taffyjs/wasm` does not switch to the native addon.
