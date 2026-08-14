---
layout: home
title: High-performance layout for JavaScript
hero:
  name: TaffyJS
  text: High-performance layout for JavaScript
  tagline: A direct JavaScript binding for Taffy, the mature layout engine written in Rust. Build Block, Flexbox, and Grid layouts without a browser or CSS parser.
  actions:
    - theme: brand
      text: View the example
      link: "#example"
    - theme: alt
      text: View the Node API
      link: https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node#api-surface
---

## Taffy in JavaScript

TaffyJS exposes Taffy's explicit layout tree through a typed JavaScript API. Layout state, caching, and computation stay in Rust; inputs and results use ordinary JavaScript values.

[Taffy](https://github.com/DioxusLabs/taffy) implements CSS Block, Flexbox, and Grid layout and is used by projects including Servo, Bevy, Slint, and Zed. TaffyJS brings that engine to JavaScript rather than implementing layout again in JavaScript.

## How it works

1. Create nodes with style values and connect them in a `TaffyTree`.
2. Compute layout explicitly from a root node and the available space.
3. Read sizes, positions, and spacing as detached JavaScript objects.

## Example

```ts
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
const first = tree.newLeaf({
  flexGrow: 1,
});
const second = tree.newLeaf({
  flexGrow: 1,
});

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: {
      width: Dimension.Length(320),
      height: Dimension.Length(80),
    },
  },
  [first, second],
);

tree.computeLayout({
  root,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
});

tree.getLayout(second).location;
// { x: 160, y: 0 }
```

## Current package

`@taffyjs/node` is an ESM-only Node-API binding. The repository currently targets Node.js 22.18 or newer and is not yet published to npm.

| Runtime        | Modules | Targets                         |
| -------------- | ------- | ------------------------------- |
| Node.js 22.18+ | ESM     | Linux x64 GNU, Windows x64 MSVC |

[Read the `@taffyjs/node` documentation](https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node)
