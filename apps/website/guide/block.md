# Block Layout

Set `display: Display.Block` when children should participate in Taffy's Block layout. This matters because Taffy's default display value is Flex, not Block.

Block layout places normal-flow children along the block axis. Floats, clearing, and positioned nodes alter that flow. The following fragment keeps one parent and makes each effect visible:

```ts
const floated = tree.newLeaf({
  display: Display.Block,
  float: Float.Left,
  size: { width: Dimension.Length(20), height: Dimension.Length(10) },
});

const cleared = tree.newLeaf({
  display: Display.Block,
  clear: Clear.Left,
  size: { width: Dimension.Length(30), height: Dimension.Length(5) },
});

const shifted = tree.newLeaf({
  display: Display.Block,
  position: Position.Relative,
  inset: { left: Dimension.Length(5), top: Dimension.Length(7) },
  size: { width: Dimension.Length(10), height: Dimension.Length(10) },
});

const root = tree.newWithChildren(
  { display: Display.Block, size: { width: Dimension.Length(100) } },
  [floated, cleared, shifted],
);
```

After computing this root, the three unrounded locations are `{ x: 0, y: 0 }`, `{ x: 0, y: 10 }`, and `{ x: 5, y: 22 }`. The second child clears the 10-unit float. The third keeps its normal-flow place and is then shifted by its relative inset.

`Display.FlowRoot` also uses Block layout, but establishes a new formatting context for its contents. `Position.Absolute` removes a child from normal flow and places it from its inset constraints instead.

## Size and the box model

The fields used most often around Block layout are:

- `size`, `minSize`, and `maxSize` constrain the node itself.
- `margin` adds space outside its border.
- `border` and `padding` contribute to its box.
- `boxSizing` selects how an explicit size relates to border and padding.
- `overflow` and `scrollbarWidth` affect overflow and the stored scrollbar size.

Each geometry field accepts either one supported semantic length for every side or axis, or a partial named record. TaffyJS does not parse CSS shorthand strings.

Block layout still only produces numbers. Your renderer decides what a border looks like, how overflow is clipped, and what content is drawn. See the standalone [Block example](./examples.md#block) for a complete module.
