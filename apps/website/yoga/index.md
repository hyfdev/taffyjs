# `@taffyjs/yoga`

`@taffyjs/yoga` is a Yoga 3.2.1 compatibility facade backed by native TaffyJS. It is for Node.js, Bun, and Deno applications that want to replace `yoga-layout` while keeping the supported Yoga API and import shape.

Read the [Design Philosophy](./design-philosophy.md) to understand what the package preserves, where Taffy remains visible, and how unsupported behavior is reported.

## Install as `yoga-layout`

Install the package under Yoga's original package name with a package-manager alias:

```json
{
  "dependencies": {
    "yoga-layout": "npm:@taffyjs/yoga@<version>"
  }
}
```

Existing imports then remain unchanged:

```ts
import Yoga from "yoga-layout";

const root = Yoga.Node.create();
const child = Yoga.Node.create();

root.setWidth(100);
root.setHeight(100);
root.insertChild(child, 0);
root.calculateLayout(100, 100, Yoga.DIRECTION_LTR);

console.log(child.getComputedLayout());
root.freeRecursive();
```

The asynchronous `yoga-layout/load` entry is also preserved.

## Runtime and compatibility

The package is ESM-only and supports Node.js 22.20 or newer, Bun 1.2+ within the Bun 1 major, and Deno 2.2+ within the Deno 2 major. Deno requires local `node_modules` plus `--allow-env`, `--allow-read`, and `--allow-ffi`. Native target support follows [`@taffyjs/node`](../node/index.md). It does not run in browsers; use [`@taffyjs/yoga-wasm`](../yoga-wasm/index.md) for the same facade over WebAssembly.

Compatibility is pinned to Yoga 3.2.1. Supported calls preserve Yoga's source shape, while known behavioral differences and unsupported features are explicit. See the [complete compatibility guide](https://github.com/hyfdev/taffyjs/blob/main/packages/taffyjs-yoga/COMPATIBILITY.md) before migrating an existing application.
