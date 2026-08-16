# `@taffyjs/yoga-wasm`

`@taffyjs/yoga-wasm` runs the same Yoga 3.2.1 compatibility facade as `@taffyjs/yoga` over `@taffyjs/wasm`. Choose it for a bundled browser application or another supported environment where a native addon is not the right fit.

Read the [Design Philosophy](./design-philosophy.md) to see why the Yoga model and the runtime transport remain separate choices.

## Install as `yoga-layout`

The package is not published yet. Once it is available, install it under Yoga's original package name:

```json
{
  "dependencies": {
    "yoga-layout": "npm:@taffyjs/yoga-wasm@<published-version>"
  }
}
```

The eager entry keeps the ordinary Yoga import:

```ts
import Yoga from "yoga-layout";

const node = Yoga.Node.create();
node.setWidth(100);
node.calculateLayout(undefined, undefined);
node.free();
```

Use `yoga-layout/load` when WebAssembly should not be compiled until `loadYoga()` is called:

```ts
import { loadYoga } from "yoga-layout/load";

const Yoga = await loadYoga();
```

## Runtime and compatibility

The package supports Node.js 22.18 or newer and modern bundled browsers within the [`@taffyjs/wasm` runtime boundary](../wasm/index.md). Direct CDN imports, legacy browsers, and non-browser edge runtimes are not currently supported.

Its public API, declarations, and compatibility classifications come from the same source as `@taffyjs/yoga`. Changing to WebAssembly does not add missing Yoga semantics; consult the same [Yoga 3.2.1 compatibility guide](https://github.com/hyfdev/taffyjs/blob/main/packages/taffyjs-yoga/COMPATIBILITY.md).
