# Design

A binding can hide its Rust library behind a new JavaScript model. That may make the first call look familiar, but it also gives users two systems to understand: the wrapper and the engine underneath it.

`@taffyjs/node` takes the other route. Taffy is the model.

## Keep Taffy visible

The public API follows Taffy's `TaffyTree` workflow: create nodes, connect them into a tree, compute a layout, and read the stored results. Computation stays explicit. Styles, layouts, and available space keep their Taffy meanings.

This also means that some behavior may not match assumptions borrowed from the DOM or from a JavaScript state library. For example, `setStyle` replaces the complete Taffy style; it does not merge an object into the existing style. That behavior is intentional, not an accident of the binding. When it is the operation you need, the direct method remains available.

The benefit is that a Taffy concept has one meaning. Reading Taffy's documentation, source, or issue discussions does not require translating through another layout abstraction first.

## Keep one owner for layout state

Taffy owns the tree topology, styles, layout cache, computation state, results, and raw node-key lifetime. JavaScript receives readable inputs, opaque bigint NodeIds, and detached result objects, but it does not maintain a second copy of the native tree or a NodeId registry.

That boundary matters when an application grows. A JavaScript shadow tree would need to stay synchronized after every mutation and failure. It could also disagree with the state that Taffy actually used. With one owner, a layout result always comes from the native tree that performed the calculation.

JavaScript still owns values that are naturally application data, such as node context. The division follows responsibility rather than forcing everything into Rust.

## Improve the crossing, not the layout model

A direct binding does not need to be deliberately inconvenient. It should solve problems created by the JavaScript-to-Rust boundary without replacing Taffy's API.

`updateStyle` is one example. It preserves fields that were not supplied and applies the change against the stored style in Rust. This is friendlier for ordinary updates and avoids reading or cloning a complete style in JavaScript only to change one field. [`setStyle` and `updateStyle`](./set-style-vs-update-style.md) remain separate because they express different operations.

The same rule applies to future performance work. A selective read API may be useful when a measured workload needs one field but a complete snapshot is expensive. If it ships, it should sit beside the complete getter, not turn the direct API into a query language that everyone must adopt.

Use Taffy's operations when the problem is layout. Add a binding-specific operation only when it makes the crossing safer, clearer, or measurably cheaper.
