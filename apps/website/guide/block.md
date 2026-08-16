# Block Layout

Set `display: Display.Block` when children should participate in Taffy's Block layout. This matters because Taffy's default display value is Flex, not Block.

Block layout places normal-flow children along the block axis. Floats, clearing, and positioned nodes alter that flow. The example below keeps one parent and makes each effect visible:

```ts
import { AvailableSpace, Clear, Display, Float, Position, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();

const floated = tree.newLeaf({
  display: Display.Block,
  float: Float.Left,
  size: { width: 20, height: 10 },
});

const cleared = tree.newLeaf({
  display: Display.Block,
  clear: Clear.Left,
  size: { width: 30, height: 5 },
});

const shifted = tree.newLeaf({
  display: Display.Block,
  position: Position.Relative,
  inset: { left: 5, top: 7 },
  size: { width: 10, height: 10 },
});

const root = tree.newWithChildren({ display: Display.Block, size: { width: 100 } }, [
  floated,
  cleared,
  shifted,
]);

tree.computeLayout({
  root,
  availableSpace: {
    width: 100,
    height: AvailableSpace.MaxContent,
  },
});

console.log(tree.getUnroundedLayout(floated).location); // { x: 0, y: 0 }
console.log(tree.getUnroundedLayout(cleared).location); // { x: 0, y: 10 }
console.log(tree.getUnroundedLayout(shifted).location); // { x: 5, y: 22 }
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

Block layout still only produces numbers. Your renderer decides what a border looks like, how overflow is clipped, and what content is drawn.
