# `@taffyjs/node`

`@taffyjs/node` is the native Node-API binding for Taffy 0.13. It provides an explicit in-memory layout tree for Block, Flexbox, and Grid and exposes the same JavaScript objects described throughout the Guide.

## Availability

The package is currently version `0.0.0`, marked private, and not published to a registry. There is no supported installation command yet. These docs describe the API implemented in the repository rather than an installable release.

The current runtime matrix is deliberately small:

| Runtime | Supported target |
| ------- | ---------------- |
| Node.js | 22.18.0 or newer |
| Linux   | x64 GNU          |
| Windows | x64 MSVC         |

The package is ESM-only. Import the public package entry:

```ts
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";
```

Do not import `native.js`, a `.node` file, or one of the platform packages directly. They are private implementation details and are not stable subpath exports.

## What the package owns

Each `TaffyTree<TContext>` owns its native tree, public node IDs, JavaScript context values, styles, cached computation state, and stored layout results. Work is synchronous and explicit: create or update nodes, call a compute method, and then read snapshots.

The API does not include a CSS parser, DOM integration, Yoga compatibility, selectors, query builders, batch commands, asynchronous or off-thread computation, or live native views. Those concerns can be implemented by a higher layer that produces `StyleInput` values and explicit compute calls.

## Reference map

- [Nodes and Topology](./nodes-and-topology.md) covers creation, inspection, parent-child changes, removal, `clear`, and `NodeId` lifetime.
- [Styles and Context](./styles-and-context.md) covers complete style replacement, style snapshots, `TContext`, and measurement invalidation.
- [Computing Layout](./computing-layout.md) covers available space, dirty state, rounding, measurement, caching, and re-entry rules.
- [Layout Results](./layout-results.md) covers ordinary, unrounded, and detailed Grid output.
- [Value Helpers](./value-helpers.md) covers every public runtime constant family and helper object.
- [Errors](./errors.md) covers stable error codes, JavaScript error classes, and state guarantees after failure.

For a task-oriented path, begin with the [Guide](../guide/index.md).
