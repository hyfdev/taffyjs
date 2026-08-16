# `@taffyjs/node`

`@taffyjs/node` is the native Node-API binding for Taffy 0.13. It provides an explicit in-memory layout tree for Block, Flexbox, and Grid through readable JavaScript inputs and outputs.

Follow [Getting Started](../guide/getting-started.md) to install the package and compute a first layout.

## Runtime support

The package requires Node.js 22.18.0 or newer and currently provides native binaries for these targets:

| Operating system | Architecture | Native target              |
| ---------------- | ------------ | -------------------------- |
| Linux            | x64          | `x86_64-unknown-linux-gnu` |
| Windows          | x64          | `x86_64-pc-windows-msvc`   |

Bun 1.2+ within major 1 and Deno 2.2+ within major 2 are also supported on these native targets. CI smoke-tests Bun 1.2.0 and Deno 2.2.0 through the public package entry. Support does not span runtime majors. Deno requires a local `node_modules` directory and the `--allow-env`, `--allow-read`, and `--allow-ffi` permissions.

The package is ESM-only. Application code imports the public package entry:

```ts
import { Display, TaffyTree } from "@taffyjs/node";
```

Do not import `native.js`, a `.node` file, or one of the platform packages directly. They are private implementation details and are not stable subpath exports.

## What the package provides

Each `TaffyTree<TContext>` owns its native tree, public node IDs, JavaScript context values, styles, cached computation state, and stored layout results. Work is synchronous and explicit: create or update nodes, call a compute method, and then read detached snapshots.

The package does not parse CSS, create DOM elements, or render output. It also does not provide Yoga compatibility or asynchronous computation. Higher layers can build those behaviors on the layout tree without changing the direct API.

## API

- [Nodes and Topology](./nodes-and-topology.md) covers node creation, inspection, parent-child changes, removal, `clear`, and `NodeId` lifetime.
- [Styles and Context](./styles-and-context.md) covers style replacement and partial updates, style snapshots, JavaScript context, and measurement invalidation.
- [Computing Layout](./computing-layout.md) covers available space, dirty state, rounding, measurement, caching, and callback restrictions.
- [Layout Results](./layout-results.md) covers ordinary, unrounded, and detailed Grid output.
- [Style](./style.md) groups the fields accepted by `StyleInput` and `StyleUpdate` and returned by `Style`.
- [Value Helpers](./value-helpers.md) covers numeric constants and tagged values used throughout style and computation inputs.
- [Errors](./errors.md) covers stable error codes, JavaScript error classes, and state after failure.
