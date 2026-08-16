# Styles and Context

Styles are native layout data. Context is arbitrary JavaScript data associated with a node. They have separate owners and update rules even though both can affect measurement.

The [Style reference](./style.md) groups the fields accepted by `StyleInput` and returned by `Style`. This page covers the `TaffyTree` methods that replace and read those values, then the separate JavaScript context methods.

## Replace and read styles

`setStyle(node, style)` replaces the node's complete stored style. It does not merge with the previous value. Missing properties and explicit `undefined` are expanded from Taffy's defaults on every call:

```ts
tree.setStyle(node, { display: Display.None, flexGrow: 2 });
tree.setStyle(node, {});

const current = tree.getStyle(node);
current.display === Display.Flex; // true
current.flexGrow === 0; // true
```

`null` is accepted only for the optional fields listed in the [Style reference](./style.md#shared-fields). Other fields reject it. Unknown top-level style fields and unknown components in partial geometry records are also rejected. A failed conversion leaves both the previous style and its dirty state unchanged.

Floating-point style values accept JavaScript numbers and are stored with Taffy's 32-bit precision. They are not coerced from strings or objects, clamped, or replaced with binding-specific defaults; negative and non-finite numbers reach Taffy as numeric values. Integer codes, indices, spans, and counts instead must be finite integers in the range of the corresponding public value.

`getStyle(node)` returns a complete detached snapshot, including defaults. Its fields are recursively readonly in TypeScript, but its runtime objects are not frozen. Mutating a returned object does not change the tree. A style snapshot can be passed back as a later `StyleInput` because its structure is compatible.

## Store JavaScript context

The generic parameter on `TaffyTree<TContext>` describes the values returned by `getNodeContext` and supplied to measurement:

```ts
type TextContext = { text: string; fontSize: number };

const tree = new TaffyTree<TextContext>();
const label = tree.newLeafWithContext({}, { text: "Hello", fontSize: 16 });
```

Context is optional measurement data, not a switch that makes a node measurable. A measure callback can receive any leaf; for a leaf without context, it receives `undefined`.

`getNodeContext(node)` returns the exact JavaScript value by identity, or `undefined` when no value is attached. `setNodeContext(node, value)` replaces the value. Passing `undefined` clears it; `null` is an ordinary present value when `TContext` includes `null`.

The wrapper holds context strongly while the node is live. `remove` releases the removed node's context, and `clear` releases them all. Context is not copied into Rust, serialized, or included in style snapshots.

Calling `setNodeContext` marks the node and affected ancestors dirty, even when the same object is supplied again. Mutating that object in place is invisible to the tree and does not mark anything dirty:

```ts
const context = tree.getNodeContext(label);

if (context) {
  context.text = "Updated";
  tree.markDirty(label);
}
```

The same manual invalidation rule applies to external values captured by a measure callback. [Computing Layout](./computing-layout.md) describes when Taffy can reuse cached measurements.
