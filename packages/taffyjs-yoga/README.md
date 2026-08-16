# @taffyjs/yoga

`@taffyjs/yoga` is a Node.js compatibility facade for `yoga-layout@3.2.1`, implemented in TypeScript over `@taffyjs/node`. It keeps Yoga's package entries and public API shape while Taffy remains the only layout engine.

The package is ESM-only, requires Node.js `>=22.18`, and does not provide a browser or WASM backend. Native platform availability follows `@taffyjs/node`; this repository currently builds Linux x64 GNU and Windows x64 MSVC packages.

This package is still private and unpublished. The installation form below describes the intended registry substitution after publication.

## Substitute it for yoga-layout

Use a package-manager alias so application source can keep importing `yoga-layout` unchanged:

```json
{
  "dependencies": {
    "yoga-layout": "npm:@taffyjs/yoga@<published-version>"
  }
}
```

The normal Yoga entry then keeps the same import and factory shape:

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

The asynchronous entry is also preserved:

```ts
import { loadYoga } from "yoga-layout/load";

const Yoga = await loadYoga();
const node = Yoga.Node.create();
node.calculateLayout(undefined, undefined);
node.free();
```

Each `loadYoga()` call creates an isolated Yoga facade with its own hidden Taffy tree. The root default export is one eagerly created facade.

## TypeScript migration for Align values

Yoga publishes one broad `Align` enum for three setters even though each property supports a different subset. `@taffyjs/yoga` reports unsupported combinations during type checking and exports the accepted sets as `AlignContentValue`, `AlignItemsValue`, and `AlignSelfValue`:

```ts
import Yoga, { Align, type AlignItemsValue, type Node } from "yoga-layout";

function setItemAlignment(node: Node, value: AlignItemsValue) {
  node.setAlignItems(value);
}

const node = Yoga.Node.create();
setItemAlignment(node, Align.Center);
node.free();
```

Code that must compile against either the official package or the replacement can derive the active provider's parameter type instead:

```ts
type AlignItemsInput = Parameters<Node["setAlignItems"]>[0];
```

A broad `Align` variable must be narrowed before being passed to one of these setters. JavaScript and other dynamic calls receive the same validation at runtime before Node state changes.

## Compatibility boundary

The compatibility baseline is exactly Yoga 3.2.1. Config, Style, tree ownership and mutation, calculation on any live Node, computed output, dirty and new-layout state, and synchronous Measure callbacks are implemented. Taffy owns topology and Flex calculation; the facade retains only the Yoga declarations and public state needed to translate inputs and project Yoga-shaped outputs.

This is core behavioral compatibility, not a claim that Taffy and Yoga produce identical geometry for every degenerate Flex combination or that their internal cache and callback traces are identical. [COMPATIBILITY.md](COMPATIBILITY.md) classifies the complete public surface and lists every known Difference and Unsupported trigger. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) contains the required third-party notice for the Yoga PixelGrid logic used by the facade.

## Versioning before 1.0

`@taffyjs/yoga` will remain on the `0.x` version line for the foreseeable future. During that period, any public breaking change uses a minor release, including a Yoga-alignment fix that changes a supported layout result or other observable behavior. Fixes that preserve the public behavior contract use patch releases. This contract applies only to `0.x` releases and makes no promise about 1.0.
