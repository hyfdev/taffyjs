# Styles and Values

TaffyJS accepts a partial `StyleInput` and stores a complete Taffy style. The public helpers make values readable in JavaScript while preserving Taffy's distinctions between lengths, percentages, automatic sizing, and keyword choices.

## Omitted fields use Taffy's defaults

You only need to write the fields that differ from the default:

```ts
const card = tree.newLeaf({
  display: Display.Flex,
  size: { width: Dimension.Length(240) },
  padding: Dimension.Length(12),
  gap: Dimension.Length(8),
});
```

A single semantic length fills every component of supported `Size` or `Rect` fields. Here `padding` applies 12 units to all four sides and `gap` applies 8 units to both axes. Use a partial record when components differ:

```ts
const panel = tree.newLeaf({
  size: {
    width: Dimension.Percent(50),
    height: Dimension.Auto,
  },
  margin: {
    left: Dimension.Length(16),
    right: Dimension.Length(16),
  },
});
```

`Dimension.Percent(50)` means 50 percent. Percent helpers use human-facing percentage magnitudes, not fractions.

An omitted property and an explicit `undefined` both use the corresponding Taffy default. `null` has a different meaning and is accepted only by fields whose public type includes it. Do not use `null` as a general way to reset a field.

## `setStyle` replaces the complete style

`setStyle` does not merge with the node's previous style. The new partial input is expanded from Taffy's defaults and then replaces the stored style:

```ts
tree.setStyle(node, { display: Display.None, flexGrow: 2 });
tree.setStyle(node, {});

const style = tree.getStyle(node);
style.display === Display.Flex; // true: Taffy's default
style.flexGrow === 0; // true: Taffy's default
```

Keep a shared base object in your own code when several replacements should preserve the same fields.

## Named constants and tagged values

Closed choices use frozen numeric families such as `Display`, `Overflow`, `FlexDirection`, and `AlignItems`:

```ts
const style = {
  display: Display.Flex,
  overflow: { x: Overflow.Hidden, y: Overflow.Scroll },
  alignItems: AlignItems.Center,
};
```

The values are numbers at runtime. Exact valid raw numeric codes are accepted as a low-level form, but named constants are the intended way to write them: they show the meaning and retain useful TypeScript types.

Values that carry data use ordinary tagged objects. `Dimension.Length(20)`, `Dimension.Percent(50)`, and `Dimension.Auto` are the common sizing forms. Computation uses `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, or `AvailableSpace.MaxContent`. Grid has its own placement and track helpers, introduced in [Grid](./grid.md).

## Outputs describe stored values

`getStyle(node)` returns every public style field, including defaults. Numbers reflect the values actually stored by Taffy, which uses 32-bit floating-point values internally. A value such as `0.1` can therefore read back with the nearest stored precision.

The returned style and all nested records and arrays are detached. They are readonly in TypeScript but are not frozen at runtime:

```ts
const snapshot = tree.getStyle(node);
const reusableInput: StyleInput = snapshot;

tree.setStyle(otherNode, reusableInput);
```

Changing `snapshot` would not update `node`; call `setStyle` to make a real change. The generated declarations remain the exhaustive field reference. The Guide pages focus on the groups of fields that work together.
