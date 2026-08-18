# `@taffyjs/node`

`@taffyjs/node` is the ESM-only Node-API binding for Taffy 0.13. It exposes an explicit in-memory layout tree, readable JavaScript inputs and outputs, and a private platform-specific native implementation.

Install it with npm:

```sh
npm install @taffyjs/node
```

The package requires Node.js 22.20.0 or newer. Its package metadata and distribution build matrix cover the napi-rs template's complete native target set: macOS x64 and ARM64; Windows x86, x64, and ARM64 MSVC; Linux x64 and ARM64 with GNU or musl plus ARMv7 GNU; Android ARMv7 and ARM64; and FreeBSD x64. The [package overview](../../apps/website/node/index.md) lists the exact Rust target triples and distinguishes build coverage from the current blocking runtime matrix.

Bun 1.2+ within major 1 and Deno 2.2+ within major 2 are smoke-tested on Linux x64 GNU and Windows x64 MSVC; support does not span runtime majors. Deno requires a local `node_modules` directory and the `--allow-env`, `--allow-read`, and `--allow-ffi` permissions. Application code imports only the public package entry:

```ts
import { TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
```

Do not import `native.js`, a `.node` file, or a platform package directly.

## Documentation

- [Guide](../../apps/website/guide/index.md) introduces the tree, styles, layout algorithms, and measurement.
- [Design philosophy](../../apps/website/node/design-philosophy.md) explains why the binding follows Taffy's model and where it adds JavaScript-specific operations.
- [`@taffyjs/node` overview](../../apps/website/node/index.md) records supported targets and the public entry point.
- The API reference covers [nodes and topology](../../apps/website/node/nodes-and-topology.md), [styles and context](../../apps/website/node/styles-and-context.md), [computation](../../apps/website/node/computing-layout.md), [layout results](../../apps/website/node/layout-results.md), [Style](../../apps/website/node/style.md), [value helpers](../../apps/website/node/value-helpers.md), and [errors](../../apps/website/node/errors.md).

The generated declaration file and its JSDoc remain the exhaustive editor-facing reference for signatures, fields, and numeric members.
