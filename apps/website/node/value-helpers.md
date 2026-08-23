# Value Helpers

The public API uses numbers for closed choices and ordinary tagged objects for values that carry data. Named exports make both forms readable. Prefer them over writing raw numeric codes.

## Numeric constant families

Each constant family is a frozen object whose members are stable numeric literals. The corresponding TypeScript type is the union of those member values.

The general style families are:

| Family              | What it selects                                     |
| ------------------- | --------------------------------------------------- |
| `Display`           | Block, Flow Root, Flexbox, Grid, or no layout.      |
| `BoxSizing`         | Border-box or content-box sizing.                   |
| `Direction`         | Left-to-right or right-to-left writing direction.   |
| `Overflow`          | Overflow handling on each axis.                     |
| `Contain`           | No, layout, paint, or combined content containment. |
| `Float` and `Clear` | Block float placement and clearing.                 |
| `Position`          | Relative or absolute positioning.                   |
| `TextAlign`         | Taffy's text-alignment contribution to layout.      |

Flexbox and alignment use `FlexDirection`, `FlexWrap`, `AlignItems`, and `AlignContent`. Grid automatic placement uses `GridAutoFlow`.

The remaining numeric families are discriminators for tagged public values: `LengthUnit`, `AvailableSpaceKind`, `GridPlacementKind`, `TrackSizingKind`, `RepetitionCountKind`, `GridTemplateComponentKind`, and `DetailedLayoutInfoKind`. You normally obtain their records through the helper objects below and use the kind family when narrowing an output value.

Exact valid raw numbers are accepted because these values also cross the native boundary as numbers:

```ts
tree.newLeaf({ display: Display.Grid }); // recommended
tree.newLeaf({ display: 3 }); // valid low-level form
```

Invalid codes throw `RangeError`. Values are not coerced from strings, booleans, or objects. A same-valued member from another structural family can satisfy the runtime code; the binding does not track where a number originated.

## Dimension and available space

`Dimension` constructs semantic sizes:

- `Dimension.Length(value)` is a concrete length.
- `Dimension.Percent(value)` uses a percentage magnitude, so `50` means 50 percent.
- `Dimension.Auto` leaves the size automatic.
- `Dimension.MinContent` and `Dimension.MaxContent` select intrinsic content sizes.
- `Dimension.FitContent` uses the available-space fit-content formula.
- `Dimension.FitContentLength(value)` and `Dimension.FitContentPercent(value)` cap fit-content with a concrete or percentage limit.
- `Dimension.Stretch` uses the stretch-fit size.
- `Dimension.Content` asks Flexbox to base `flexBasis` on content; in `size`, Taffy treats it like `Auto`.

`AvailableSpace` describes a computation constraint:

- `AvailableSpace.Definite(value)` supplies a concrete value.
- `AvailableSpace.MinContent` requests minimum-content sizing.
- `AvailableSpace.MaxContent` requests maximum-content sizing.

These are different concepts even when both eventually affect a size. A `Dimension` belongs in style; an `AvailableSpace` belongs in compute options or callback arguments.

For input, a direct number is the concise form of the common concrete case. A style length of `20` is equivalent to `Dimension.Length(20)`, and an available-space value of `800` is equivalent to `AvailableSpace.Definite(800)`. The helpers remain useful when the complete form matters. Binding outputs always use complete tagged objects, which can be passed back as input.

## Grid values

`GridPlacement` provides `Auto`, `Line(index)`, `NamedLine(name, index)`, `Span(span)`, and `NamedSpan(name, span)`.

`TrackSizingFunction` provides `Length(value)`, `Percent(value)`, `Auto`, `MinContent`, `MaxContent`, `FitContent(value)`, `Fr(value)`, and `MinMax(min, max)`. Every result contains the complete minimum and maximum track pair Taffy stores.

`RepetitionCount` provides `Count(value)`, `AutoFill`, and `AutoFit`. `GridTemplateComponent.Single(track)` wraps one explicit track, while `GridTemplateComponent.Repeat(count, tracks, lineNames?)` describes a repeated group.

All helper calls return the same ordinary record shapes accepted as direct input. Payload-bearing calls create mutable records. Shared fieldless values such as `Dimension.Auto` are frozen and may be reused. Object identity has no layout meaning.

Binding outputs use the corresponding tagged shapes and can be passed back as input. Use discriminators when you need to read a variant-specific payload:

```ts
const width = tree.getStyle(node).size.width;

switch (width.unit) {
  case LengthUnit.Length:
  case LengthUnit.Percent:
  case LengthUnit.FitContentLength:
  case LengthUnit.FitContentPercent:
    console.log(width.value);
    break;
  case LengthUnit.Auto:
  case LengthUnit.MinContent:
  case LengthUnit.MaxContent:
  case LengthUnit.FitContent:
  case LengthUnit.Stretch:
  case LengthUnit.Content:
    break;
}
```

The full `Dimension` family is accepted by `size` and `flexBasis`. `minSize` and `maxSize` deliberately remain limited to concrete lengths, percentages, and `Auto`.

The generated declaration file is the exhaustive source for every numeric member and tagged TypeScript shape. This page groups the exports by how they are used rather than duplicating that declaration.
