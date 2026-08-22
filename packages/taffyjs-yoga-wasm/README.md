# @taffyjs/yoga-wasm

`@taffyjs/yoga-wasm` is an ESM Yoga 3.2.1 compatibility facade backed by `@taffyjs/wasm`. It uses the same TypeScript facade, public entries, declarations, and compatibility classifications as `@taffyjs/yoga`; only the TaffyJS runtime backend changes. Taffy is at revision [`55cda62a`](https://github.com/DioxusLabs/taffy/commit/55cda62a5df9a5d04c0023be6f6dd607b1474fe9).

The [Design](../../apps/website/yoga-wasm/design.md) explains why the Yoga-facing model and runtime transport remain separate choices.

The package supports Node.js `>=22.20`, Bun 1.2+ within the Bun 1 major, Deno 2.2+ within the Deno 2 major, and modern bundled browsers within the [documented `@taffyjs/wasm` runtime boundary](https://github.com/hyfdev/taffyjs/blob/main/packages/taffyjs-wasm/README.md). Deno requires no permission flags. Browser consumers need a bundler that honors package export conditions and top-level await. Direct CDN scripts, legacy browsers, and non-browser edge runtimes are not currently supported.

Install this package under Yoga's original package name with a package-manager alias.

## Substitute it for yoga-layout

Use a package-manager alias so application source can keep importing `yoga-layout` unchanged:

```json
{
  "dependencies": {
    "yoga-layout": "npm:@taffyjs/yoga-wasm@<version>"
  }
}
```

The eager root entry keeps Yoga's normal import shape:

```ts
import Yoga from "yoga-layout";

const node = Yoga.Node.create();
node.setWidth(100);
node.calculateLayout(undefined, undefined);
console.log(node.getComputedWidth());
node.free();
```

The `/load` entry defers loading and compiling the WebAssembly backend until `loadYoga()` is called:

```ts
import { loadYoga } from "yoga-layout/load";

const Yoga = await loadYoga();
const node = Yoga.Node.create();
node.calculateLayout(undefined, undefined);
node.free();
```

Each `loadYoga()` call creates an isolated Yoga facade and hidden Taffy tree. Facades share the package's loaded WebAssembly module and memory, but Nodes and Configs cannot cross facade boundaries.

## Compatibility boundary

The supported Yoga surface and known layout differences are exactly those documented for [`@taffyjs/yoga`](https://github.com/hyfdev/taffyjs/blob/main/packages/taffyjs-yoga/COMPATIBILITY.md). In particular, `PositionType.Static` remains unsupported because changing the transport to WebAssembly does not add a Taffy representation for Yoga's static-positioning semantics.

Expected validation and callback failures remain recoverable. An unexpected Rust panic follows the `@taffyjs/wasm` abort boundary and can terminate the current WebAssembly module or worker rather than unwinding like the native Node backend.

[THIRD-PARTY-LICENSES](THIRD-PARTY-LICENSES) contains the required third-party license for the Yoga PixelGrid logic shared by both compatibility packages.
