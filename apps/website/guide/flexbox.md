# Flexbox

Flexbox turns one axis into the main axis and distributes space among children on that axis. `FlexDirection` chooses the axis and its direction; the same child styles can therefore produce a different layout when only the parent direction changes.

Start with two stable children and one stable parent style:

```ts
const first = tree.newLeaf({
  flexGrow: 1,
  size: { width: 20, height: 10 },
});
const second = tree.newLeaf({
  flexGrow: 1,
  size: { width: 20, height: 10 },
});

const baseStyle = {
  display: Display.Flex,
  size: { width: 100, height: 60 },
};
const root = tree.newWithChildren({ ...baseStyle, flexDirection: FlexDirection.Row }, [
  first,
  second,
]);
```

With `Row`, the 60 units left after the two 20-unit base widths are shared through `flexGrow`. Each child becomes 50 units wide. Replacing only the root style with `flexDirection: FlexDirection.Column` moves the main axis to height; each child becomes 30 units tall instead.

```ts
tree.setStyle(root, { ...baseStyle, flexDirection: FlexDirection.Column });
tree.computeLayout({ root, availableSpace });
```

The children are the same nodes, in the same order, with the same styles. The changed direction is what changes which dimension receives the free space.

## The related controls

`flexBasis` supplies the starting main-axis size when present. `flexGrow` divides positive free space. `flexShrink` controls how items contract when their bases do not fit. `size`, `minSize`, and `maxSize` still constrain the result.

`FlexWrap.Wrap` allows items to form additional lines when they do not fit on one line; `WrapReverse` reverses the cross-axis line direction. Without wrapping, `FlexWrap.NoWrap` keeps one line.

Alignment names describe where remaining space goes:

- `justifyContent` acts along the main axis.
- `alignItems` supplies the default on the cross axis.
- `alignSelf` overrides cross-axis alignment for one child.
- `alignContent` distributes multiple wrapped lines on the cross axis.

Use `AlignItems` for item alignment and `AlignContent` for content distribution. For example, `AlignItems.Center` centers items across the line, while `AlignContent.SpaceBetween` distributes multiple lines. These are Taffy style values; TaffyJS does not reinterpret them as a separate layout system.

The complete [Flexbox example](./examples.md#flexbox) shows free-space distribution and verifies the resulting size and location.
