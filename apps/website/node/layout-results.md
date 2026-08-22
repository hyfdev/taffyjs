# Layout Results

Layout getters return the values Taffy currently stores. They do not check whether a node is dirty and do not start a computation.

## Rounded and unrounded layout

`getLayout(node)` reads the result selected by the current rounding mode. Rounding is enabled by default, so this normally returns pixel-rounded positions and sizes. When rounding is disabled, it selects the unrounded data.

`getUnroundedLayout(node)` always reads the unrounded result. Use it when fractional values must be preserved regardless of the tree's current public rounding mode.

A new node has a zero layout before its first computation. After a successful compute, both methods read stored results. If a later mutation marks the node dirty, they continue returning those stored values until another computation replaces them.

## `Layout`

Both getters return the same `Layout` shape:

| Field           | Meaning                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `order`         | Stable traversal order in the stored layout.                                                                                                                                   |
| `location`      | `{ x, y }` position relative to the parent.                                                                                                                                    |
| `size`          | Outer `{ width, height }` of the node.                                                                                                                                         |
| `contentSize`   | Width and height of the node's laid-out content. The node's own end padding counts only for a scroll container, and content overflowing past the scroll origin does not count. |
| `scrollbarSize` | Width and height reserved for scrollbars.                                                                                                                                      |
| `border`        | Resolved left, right, top, and bottom border widths.                                                                                                                           |
| `padding`       | Resolved left, right, top, and bottom padding widths.                                                                                                                          |
| `margin`        | Resolved left, right, top, and bottom margins.                                                                                                                                 |

Every read returns a new detached object with detached nested geometry. The fields are readonly in TypeScript but are not frozen at runtime. Mutating one result never updates the native tree or another result.

## Detailed Grid information

`getDetailedLayoutInfo(node)` returns a tagged `DetailedLayoutInfo` value. Narrow it with `DetailedLayoutInfoKind`:

```ts
const detail = tree.getDetailedLayoutInfo(node);

if (detail.kind === DetailedLayoutInfoKind.Grid) {
  detail.value.rows.sizes;
  detail.value.columns.gutters;
  detail.value.items;
}
```

The Grid payload contains:

- row and column records with negative implicit, explicit, and positive implicit track counts;
- resolved gutter and track-size arrays;
- resolved row and column start and end lines for each reported item.

`DetailedLayoutInfoKind.None` has no payload. As with ordinary layouts, this getter returns stored data rather than computing or proving freshness. Taffy can retain earlier Grid detail after a later non-Grid computation, so use it in the same update step as the Grid computation whose details you intend to inspect.

Detailed records and all nested arrays are detached readonly snapshots and are not runtime-frozen.
