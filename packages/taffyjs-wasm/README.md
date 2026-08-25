# `@taffyjs/wasm`

`@taffyjs/wasm` runs the Taffy 0.14.0 layout engine as threadless WebAssembly in Node.js, Bun 1.2+ within major 1, Deno 2.2+ within major 2, and bundled browsers. It exposes the same public TaffyJS API as `@taffyjs/node`; choosing this package guarantees that the implementation is Wasm rather than a native addon.

The [Design](../../apps/website/wasm/design.md) explains how the package keeps one direct API across native and WebAssembly runtimes.

```ts
import { TaffyTree } from "@taffyjs/wasm";

const tree = new TaffyTree();
const root = tree.newLeaf({ size: { width: 120, height: 80 } });
tree.computeLayout({ root, availableSpace: { width: 800, height: 600 } });
```

No explicit initialization call is needed. The Wasm payload is inlined once in the package's JavaScript. Node.js initializes it synchronously during module evaluation without top-level await; bundled browsers wait for asynchronous compilation and initialization through the ESM module graph. To load the package lazily on either host, use JavaScript's standard dynamic import:

```ts
const { TaffyTree } = await import("@taffyjs/wasm");
```

The supported browser path is through a bundler that honors conditional exports and top-level await. It does not emit or fetch a separate `.wasm` asset. Deno needs no runtime permission flags. Bun versions below 1.2, Deno versions below 2.2, other Bun and Deno majors, direct CDN use, and other runtimes are not currently part of the package contract.
