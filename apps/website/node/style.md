# Style

`StyleInput` is the partial object accepted when a node is created or passed to `setStyle`; omitted fields and explicit `undefined` use Taffy's defaults. `StyleUpdate` has the same accepted field shapes for `updateStyle`, but omitted fields and explicit `undefined` preserve stored values. `Style` is the complete detached object returned by `TaffyTree.getStyle(node)` or by a measure callback's on-demand `getStyle()` function.

Concrete lengths can usually be written as numbers. For example, `size: { width: 200 }` is the concise form of `size: { width: Dimension.Length(200) }`. Percentage, automatic, intrinsic, and Grid-specific values remain explicit. [Styles and Values](../guide/styles-and-values.md) explains these input forms in context.

## Shared fields

These fields describe the node itself or are shared by more than one layout mode:

| Fields                                                                                     | Purpose                                                                  |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `display`, `itemIsTable`, `itemIsReplaced`                                                 | Select layout participation and Taffy's table or replaced-item behavior. |
| `boxSizing`, `direction`, `overflow`, `scrollbarWidth`                                     | Control box sizing, writing direction, and overflow contributions.       |
| `position`, `inset`                                                                        | Keep a node in normal flow or position it relatively or absolutely.      |
| `size`, `minSize`, `maxSize`, `aspectRatio`                                                | Supply preferred and limiting dimensions.                                |
| `margin`, `padding`, `border`, `gap`                                                       | Supply spacing around, inside, and between boxes.                        |
| `alignItems`, `alignSelf`, `justifyItems`, `justifySelf`, `alignContent`, `justifyContent` | Align items, individual nodes, or groups of lines and tracks.            |

Geometry fields accept either one supported value for every component or a partial named record. For example, `padding: 12` applies to all four sides. With creation or `setStyle`, `padding: { left: 12, right: 12 }` fills the other sides from defaults; with `updateStyle`, it preserves the other stored sides.

The optional fields `aspectRatio`, the six alignment fields, and `gridTemplateAreas` accept `null` to store Taffy's absent value. Other fields reject `null`.

## Block fields

| Fields           | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `float`, `clear` | Place a float or move normal-flow content past preceding floats. |
| `textAlign`      | Select the text-alignment contribution used by Block layout.     |

Block layout also uses the shared sizing, box-model, overflow, and positioning fields. See the [Block guide](../guide/block.md) for a complete tree.

## Flexbox fields

| Fields                                | Purpose                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `flexDirection`, `flexWrap`           | Select the main axis and whether items form new lines. |
| `flexBasis`, `flexGrow`, `flexShrink` | Set the starting main size and distribute free space.  |

The shared alignment fields control placement along the main and cross axes. See the [Flexbox guide](../guide/flexbox.md) for how these fields work together.

## Grid container fields

| Fields                                            | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `gridTemplateRows`, `gridTemplateColumns`         | Define the explicit row and column tracks.            |
| `gridAutoRows`, `gridAutoColumns`, `gridAutoFlow` | Size implicit tracks and control automatic placement. |
| `gridTemplateAreas`                               | Define named rectangular template areas.              |
| `gridTemplateRowNames`, `gridTemplateColumnNames` | Attach line names to the explicit template.           |

## Grid item fields

| Fields                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `gridRow`, `gridColumn` | Place an item between named, numbered, or spanned lines. |

The [Grid guide](../guide/grid.md) introduces the helper values used by these fields and shows a complete computation.

## Reading, replacing, and updating style

`getStyle(node)` returns every field, including defaults, as a detached `Style` snapshot. That snapshot can be passed back anywhere a `StyleInput` or `StyleUpdate` is accepted. `setStyle(node, input)` replaces the complete stored style from defaults. `updateStyle(node, update)` preserves omitted fields and omitted partial-geometry components while replacing arrays, tagged values, and complete records as whole values. See [Styles and Context](./styles-and-context.md) for the exact mutation and invalidation behavior.

The package declarations and JSDoc remain the exact reference for each field's accepted TypeScript shape and each numeric constant member. This page groups the fields by their role so related choices can be found together.
