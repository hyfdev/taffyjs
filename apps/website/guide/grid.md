# Grid

Grid layout separates track sizing from item placement. The parent defines rows and columns; children select grid lines or let Taffy place them automatically.

## Define explicit tracks

An explicit template is an array of `GridTemplateComponent` values. A single component wraps one complete `TrackSizingFunction`:

```ts
const columns = [
  GridTemplateComponent.Single(TrackSizingFunction.Length(120)),
  GridTemplateComponent.Single(TrackSizingFunction.Fr(1)),
];

const rootStyle = {
  display: Display.Grid,
  gridTemplateColumns: columns,
  gridTemplateRows: [
    GridTemplateComponent.Single(TrackSizingFunction.MinContent),
    GridTemplateComponent.Single(TrackSizingFunction.Auto),
  ],
};
```

The first column has a fixed 120-unit track. The second receives a fraction of the remaining space. Intrinsic choices such as `MinContent`, `MaxContent`, and `Auto` let the algorithm use item contributions.

Use `TrackSizingFunction.MinMax(min, max)` when the two bounds differ. Existing helper parts can supply those bounds without writing numeric tags:

```ts
const flexible = TrackSizingFunction.MinMax(
  TrackSizingFunction.MinContent.min,
  TrackSizingFunction.Fr(1).max,
);
```

`FitContent(Dimension.Length(240))` is another maximum-track form. Percentage track helpers use percentage magnitudes, so `TrackSizingFunction.Percent(25)` means 25 percent.

## Place items by lines

Grid placement uses line and span helpers:

```ts
const item = tree.newLeaf({
  gridRow: {
    start: GridPlacement.Line(1),
    end: GridPlacement.Span(2),
  },
  gridColumn: {
    start: GridPlacement.NamedLine("content", 1),
  },
});
```

`GridPlacement.Auto` leaves a side to automatic placement. `Line`, `NamedLine`, `Span`, and `NamedSpan` preserve the distinctions Taffy needs; TaffyJS does not parse CSS grid strings.

Items that need tracks beyond the explicit template use `gridAutoRows` and `gridAutoColumns`. `GridAutoFlow` chooses row or column placement and has dense variants for filling earlier gaps.

## Repeat tracks

`GridTemplateComponent.Repeat` keeps repeated tracks as one template component:

```ts
const repeated = GridTemplateComponent.Repeat(RepetitionCount.Count(3), [
  TrackSizingFunction.MinMax(TrackSizingFunction.MinContent.min, TrackSizingFunction.Fr(1).max),
]);
```

`RepetitionCount.AutoFill` and `AutoFit` provide the intrinsic repetition forms. The optional third argument supplies the internal line-name arrays when named lines are needed. Top-level template line names and template areas use their corresponding typed records.

## Inspect the resolved grid

After computing a Grid root, `getDetailedLayoutInfo(root)` can expose the resolved tracks and item placement. Narrow the tagged result before reading the Grid payload:

```ts
const detail = tree.getDetailedLayoutInfo(root);

if (detail.kind === DetailedLayoutInfoKind.Grid) {
  console.log(detail.value.columns.sizes);
  console.log(detail.value.items);
}
```

The row and column records distinguish negative implicit, explicit, and positive implicit tracks and include resolved gutter and track sizes. Item records report the resolved start and end lines. This data is a detached snapshot, just like ordinary layout output.

The [complete Grid example](./examples.md#grid) defines two explicit columns, places one item, and verifies both its rectangle and the parent computation.
