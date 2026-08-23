# Flexbox

Flexbox turns one axis into the main axis and distributes space among children on that axis. `FlexDirection` chooses the axis and its direction; the same child styles can therefore produce a different layout when only the parent direction changes.

The example below uses two stable children and one stable parent style. It first lays them out in a row, then changes only the parent direction and computes again:

```ts
import { Display, FlexDirection, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();

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
const root = tree.newWithChildren([first, second], {
  ...baseStyle,
  flexDirection: FlexDirection.Row,
});

tree.computeLayout({ root, availableSpace: { width: 100, height: 60 } });

console.log(tree.getUnroundedLayout(first).size); // { width: 50, height: 10 }
console.log(tree.getUnroundedLayout(second).location); // { x: 50, y: 0 }

tree.setStyle(root, { ...baseStyle, flexDirection: FlexDirection.Column });
tree.computeLayout({ root, availableSpace: { width: 100, height: 60 } });

console.log(tree.getUnroundedLayout(first).size); // { width: 20, height: 30 }
console.log(tree.getUnroundedLayout(second).location); // { x: 0, y: 30 }
```

With `Row`, the 60 units left after the two 20-unit base widths are shared through `flexGrow`. Each child becomes 50 units wide. Replacing only the root style with `flexDirection: FlexDirection.Column` moves the main axis to height; each child becomes 30 units tall instead.

The children are the same nodes, in the same order, with the same styles. The changed direction is what changes which dimension receives the free space.

## The related controls

`flexBasis` supplies the starting main-axis size when present. Use `Dimension.Content` to derive that basis from the item's measured content. `flexGrow` divides positive free space. `flexShrink` controls how items contract when their bases do not fit. `size`, `minSize`, and `maxSize` still constrain the result.

`FlexWrap.Wrap` allows items to form additional lines when they do not fit on one line; `WrapReverse` reverses the cross-axis line direction. `FlexWrap.Balance` distributes items more evenly across lines, and `BalanceReverse` combines that distribution with reversed cross-axis line direction. Without wrapping, `FlexWrap.NoWrap` keeps one line.

`flexLineCount` requests at least that many lines for balanced wrapping. For any multi-line wrapping mode, it also tells Taffy how many lines to use when dividing definite cross-axis space for measurement. The default is `1`; use a positive integer up to 65,535. It has no layout effect with `FlexWrap.NoWrap`.

Alignment names describe where remaining space goes:

- `justifyContent` acts along the main axis.
- `alignItems` supplies the default on the cross axis.
- `alignSelf` overrides cross-axis alignment for one child.
- `alignContent` distributes multiple wrapped lines on the cross axis.

Use `AlignItems` for item alignment and `AlignContent` for content distribution. For example, `AlignItems.Center` centers items across the line, while `AlignContent.SpaceBetween` distributes multiple lines. These are Taffy style values; TaffyJS does not reinterpret them as a separate layout system.

The example above uses unrounded results so the same code also works when the division produces fractional values.
