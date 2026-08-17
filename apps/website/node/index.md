# `@taffyjs/node`

`@taffyjs/node` is the native Node-API binding for Taffy 0.13. It provides an explicit in-memory layout tree for Block, Flexbox, and Grid through readable JavaScript inputs and outputs.

Follow [Getting Started](../guide/getting-started.md) to install the package and compute a first layout.

Read the [Design Philosophy](./design-philosophy.md) to understand why the API follows Taffy's model and where the binding deliberately adds JavaScript-specific operations.

## Runtime support

The package requires Node.js 22.20.0 or newer. Its native package metadata and distribution build matrix cover these targets:

| Operating system | Architecture | Native target                   |
| ---------------- | ------------ | ------------------------------- |
| Android          | ARMv7        | `armv7-linux-androideabi`       |
| Android          | ARM64        | `aarch64-linux-android`         |
| FreeBSD          | x64          | `x86_64-unknown-freebsd`        |
| Linux            | ARMv7 GNU    | `armv7-unknown-linux-gnueabihf` |
| Linux            | ARM64 GNU    | `aarch64-unknown-linux-gnu`     |
| Linux            | ARM64 musl   | `aarch64-unknown-linux-musl`    |
| Linux            | x64 GNU      | `x86_64-unknown-linux-gnu`      |
| Linux            | x64 musl     | `x86_64-unknown-linux-musl`     |
| macOS            | ARM64        | `aarch64-apple-darwin`          |
| macOS            | x64          | `x86_64-apple-darwin`           |
| Windows          | ARM64 MSVC   | `aarch64-pc-windows-msvc`       |
| Windows          | x86 MSVC     | `i686-pc-windows-msvc`          |
| Windows          | x64 MSVC     | `x86_64-pc-windows-msvc`        |

This matches the complete native target set carried by napi-rs's maintained package templates. CI compiles every row and retains each binary as a build artifact. The current blocking runtime suite loads the Linux x64 GNU, Windows x64 MSVC, and macOS ARM64 binaries; the other ten rows have build coverage but are not yet runtime-tested or published by this repository, so the table does not claim a broader tested runtime matrix. TaffyJS keeps WebAssembly explicit: the separate [`@taffyjs/wasm`](../wasm/index.md) package provides the threadless Wasm build instead of making `@taffyjs/node` silently fall back to napi-rs's threaded WASI target.

Bun 1.2+ within major 1 and Deno 2.2+ within major 2 are smoke-tested on Linux x64 GNU and Windows x64 MSVC. Support does not span runtime majors. Deno requires a local `node_modules` directory and the `--allow-env`, `--allow-read`, and `--allow-ffi` permissions.

The package is ESM-only. Application code imports the public package entry:

```ts
import { Display, TaffyTree } from "@taffyjs/node";
```

Do not import `native.js`, a `.node` file, or one of the platform packages directly. They are private implementation details and are not stable subpath exports.

## What the package provides

Each `TaffyTree<TContext>` owns its native tree, public node IDs, JavaScript context values and per-node measure functions, styles, cached computation state, and stored layout results. Work is synchronous and explicit: create or update nodes, call a compute method, and then read detached snapshots.

The package does not parse CSS, create DOM elements, or render output. It also does not provide Yoga compatibility or asynchronous computation. Higher layers can build those behaviors on the layout tree without changing the direct API.

## API

- [Nodes and Topology](./nodes-and-topology.md) covers node creation, inspection, parent-child changes, removal, `clear`, and `NodeId` lifetime.
- [Styles and Context](./styles-and-context.md) covers style replacement and partial updates, style snapshots, JavaScript context, and measurement invalidation.
- [Computing Layout](./computing-layout.md) covers available space, dirty state, rounding, measurement, caching, and callback restrictions.
- [Layout Results](./layout-results.md) covers ordinary, unrounded, and detailed Grid output.
- [Style](./style.md) groups the fields accepted by `StyleInput` and `StyleUpdate` and returned by `Style`.
- [Value Helpers](./value-helpers.md) covers numeric constants and tagged values used throughout style and computation inputs.
- [Errors](./errors.md) covers stable error codes, JavaScript error classes, and state after failure.
