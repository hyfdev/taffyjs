# `@taffyjs/node`

`@taffyjs/node` is the ESM-only Node-API binding for Taffy 0.13. It exposes an explicit in-memory layout tree, readable JavaScript inputs and outputs, and a private platform-specific native implementation.

The package currently has version `0.0.0`, is marked private, and requires Node.js 22.18.0 or newer. Nothing in this repository publishes it to a registry.

The current native targets are Linux x64 GNU and Windows x64 MSVC. Application code imports only the public package entry:

```ts
import { TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
```

Do not import `native.js`, a `.node` file, or a platform package directly.

## Documentation

- [Guide](../../apps/website/guide/index.md) introduces the tree, styles, layout algorithms, measurement, and complete examples.
- [`@taffyjs/node` overview](../../apps/website/node/index.md) records availability, supported targets, and the public entry point.
- The API reference covers [nodes and topology](../../apps/website/node/nodes-and-topology.md), [styles and context](../../apps/website/node/styles-and-context.md), [computation](../../apps/website/node/computing-layout.md), [layout results](../../apps/website/node/layout-results.md), [value helpers](../../apps/website/node/value-helpers.md), and [errors](../../apps/website/node/errors.md).

The generated declaration file and its JSDoc remain the exhaustive editor-facing reference for signatures, fields, and numeric members.
