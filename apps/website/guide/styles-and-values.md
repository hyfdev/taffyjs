# Styles and Values

TaffyJS accepts a partial `StyleInput` and stores a complete Taffy style. The public helpers make values readable in JavaScript while preserving Taffy's distinctions between lengths, percentages, automatic sizing, and keyword choices.

## Omitted fields use Taffy's defaults

You only need to write the fields that differ from the default:

```ts
const card = tree.newLeaf({
  display: Display.Flex,
  size: { width: 240 },
  padding: 12,
  gap: 8,
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
    left: 16,
    right: 16,
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

## `updateStyle` preserves omitted values

Use `updateStyle` when only part of the current style should change. Omitted fields and explicit `undefined` preserve their stored values. The same rule applies to omitted components of the partial `Point`, `Size`, `Rect`, and `Line` records:

```ts
tree.updateStyle(node, {
  flexGrow: 3,
  size: { width: 320 },
  margin: { left: 20 },
});
```

Here the current height and the other three margins remain unchanged. A single shorthand value still supplies every component, so `padding: 12` replaces all four padding sides.

Arrays, tagged values, and other complete records are replaced as complete values rather than merged recursively. For example, `gridAutoRows: []` clears all automatic row tracks, and `flexBasis: Dimension.Auto` replaces the complete tagged basis value. `null` clears only a field whose public type permits it.

The prospective merged style is validated before it is stored. A failed update changes neither style nor dirty state. An empty update or one that supplies only already-stored values also leaves dirty state unchanged.

Unless you intentionally want a complete replacement, prefer `updateStyle` when changing an existing node. [setStyle vs updateStyle](../node/set-style-vs-update-style.md) explains the semantic and performance tradeoff in detail.

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

Values that carry data use ordinary tagged objects. A number is the concise input form for a concrete length, so `20` is equivalent to `Dimension.Length(20)`. Other sizing meanings stay explicit: `Dimension.Percent(50)`, `Dimension.Auto`, `Dimension.MinContent`, `Dimension.MaxContent`, `Dimension.FitContent`, `Dimension.FitContentLength(value)`, `Dimension.FitContentPercent(value)`, `Dimension.Stretch`, and `Dimension.Content`. The complete `Dimension` family is valid for `size` and `flexBasis`; `minSize` and `maxSize` remain limited to concrete lengths, percentages, and auto. A numeric available-space component is likewise equivalent to `AvailableSpace.Definite(value)`, while `AvailableSpace.MinContent` and `AvailableSpace.MaxContent` stay explicit. The complete helpers remain valid, and outputs always use complete tagged objects. Grid has its own placement and track helpers, introduced in [Grid](./grid.md).

## Outputs describe stored values

`getStyle(node)` returns every public style field, including defaults. Numbers reflect the values actually stored by Taffy, which uses 32-bit floating-point values internally. A value such as `0.1` can therefore read back with the nearest stored precision.

The returned style and all nested records and arrays are detached. They are readonly in TypeScript but are not frozen at runtime:

```ts
const snapshot = tree.getStyle(node);
const reusableInput: StyleInput = snapshot;

tree.setStyle(otherNode, reusableInput);
```

Changing `snapshot` would not update `node`; call `setStyle` or `updateStyle` to make a real change. The generated declarations remain the exhaustive field reference. The Guide pages focus on the groups of fields that work together.
