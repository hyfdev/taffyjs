# setStyle vs updateStyle

When changing an existing node, prefer `updateStyle`. Use `setStyle` only when you intentionally want to replace the node's complete style or reset omitted fields to Taffy's defaults.

Both methods accept ordinary partial-looking JavaScript objects, but omission has a different meaning:

| Operation                                                                 | `setStyle(node, input)`             | `updateStyle(node, update)`                    |
| ------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| Omitted top-level field                                                   | Reset to its Taffy default          | Preserve the stored value                      |
| Explicit `undefined`                                                      | Reset to its Taffy default          | Preserve the stored value                      |
| Omitted component in `size`, `margin`, or another partial geometry record | Reset that component to its default | Preserve that component                        |
| Supplied array, tagged value, or complete record                          | Replace the complete value          | Replace the complete value                     |
| Empty object                                                              | Reset the complete style            | Make no change                                 |
| Supplied values already match the stored values                           | Perform a complete replacement      | Make no change and do not newly dirty the node |

## Choose by intent

Suppose a node already has a display mode, size, and flex growth:

```ts
const node = tree.newLeaf({
  display: Display.Grid,
  size: { width: 320, height: 180 },
  flexGrow: 1,
});
```

`updateStyle` changes only what you name:

```ts
tree.updateStyle(node, { flexGrow: 2 });

// display and size are preserved
```

The same object passed to `setStyle` means something different:

```ts
tree.setStyle(node, { flexGrow: 2 });

// display and size are reset to their Taffy defaults
```

This makes `updateStyle` the direct expression of an incremental change. It also avoids keeping a complete JavaScript shadow of native style state merely so that unrelated values can be supplied again.

## Why `updateStyle` is generally faster

A `setStyle` replacement must convert every supplied field from JavaScript into its native Taffy representation. Rebuilding the replacement with object spread does not avoid that work:

```ts
const nextStyle = { ...previousStyle, flexGrow: 2 };
tree.setStyle(node, nextStyle);
```

The spread is shallow, but all retained fields in `nextStyle` still cross the JavaScript-to-native boundary again. Arrays and nested style values must be visited and converted even when they did not change. If `previousStyle` came from `getStyle`, producing that complete snapshot adds another native-to-JavaScript conversion first.

`updateStyle` sends and converts only the supplied fields, then combines them with the stored style on the native side:

```ts
tree.updateStyle(node, { flexGrow: 2 });
```

The advantage usually grows with the number and complexity of retained fields. Small scalar-only styles may be close, while preserving large arrays or nested values can make reconstructing a `setStyle` input substantially more expensive.

This is a default choice, not a promise that every individual `updateStyle` call is faster. Replacing a large collection still requires converting that collection, and exact costs depend on the values and runtime. The general rule remains: unless complete replacement is the intended behavior, prefer `updateStyle`.

## When `setStyle` is the right operation

Use `setStyle` when the input is the authoritative complete replacement and omission should mean “use the default.” Common examples are:

- Resetting every field with `tree.setStyle(node, {})`.
- Applying a complete style snapshot or configuration that should replace earlier state.
- Deliberately clearing any old fields that the replacement does not name.

Do not use `setStyle` plus `getStyle` or a caller-owned shadow object merely to update one field. That recreates incremental-update behavior in JavaScript and pays for converting the retained data again.

## Updates are shallow by design

`updateStyle` preserves omitted top-level fields and omitted components of partial `Point`, `Size`, `Rect`, and `Line` records. It does not recursively merge every nested value. A supplied array replaces the whole array, and a supplied tagged value or complete record replaces that whole value:

```ts
tree.updateStyle(node, {
  size: { width: 480 }, // preserves the current height
  gridAutoRows: [], // clears every automatic row track
  flexBasis: Dimension.Auto, // replaces the complete tagged value
});
```

See [Styles and Values](../guide/styles-and-values.md) for the shared value rules and the [Style reference](./style.md) for the complete field groups.
