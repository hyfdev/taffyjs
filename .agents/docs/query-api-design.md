# Selective Query Design Notes

## Motivation

The direct @taffyjs/node getters return complete owned JavaScript snapshots of Taffy's native values. That is the correct baseline behavior, but it can do unnecessary work when a consumer needs only one field or one value inside a nested collection: native code still walks and converts the unrequested parts of the snapshot before JavaScript discards them.

The proposed addition is a way to read only the requested value. It complements complete getters rather than replacing them. A consumer that needs most of a Style, Layout, or DetailedLayoutInfo value should continue to request the complete snapshot.

## Reference design

A selective query reads one explicitly supported value from one node's Style, Layout, or DetailedLayoutInfo.

- The project owns a finite list of public selectors. The list may include top-level fields, fields inside fixed records or tagged variants, collection lengths, collection elements, and deeper collection values where the number and order of indices are fixed for that selector.
- Collection indices are values supplied separately from the selector. Numeric text, wildcards, filters, slices, callbacks, and arbitrary path expressions are not part of the selector language.
- JavaScript resolves the selector through generated static metadata before entering native code. Native code receives a private operation identifier, exhaustively dispatches it, and directly reads and converts the selected Rust value. Native code does not parse the public selector or create a parent JavaScript object and then extract one child.
- One canonical selector list keeps the public TypeScript calls and result types, JavaScript lookup and index count, and Rust dispatch contract consistent. People decide which selectors belong in the public API; generation only expands and verifies that decision.

The intended flow is:

```text
public selector and indices
  -> generated JavaScript lookup
  -> private native operation
  -> direct access to the selected Rust value
  -> selected JavaScript result
```

## Boundaries

This design is deliberately smaller than a general query language.

- Each call starts from one NodeId and one kind of per-node data: Style, Layout, or DetailedLayoutInfo.
- A selector may only follow paths explicitly listed by the project. It cannot discover or execute an arbitrary path at runtime.
- It does not search, filter, sort, or traverse the Taffy node tree.
- It does not combine unrelated fields into a caller-defined result shape.
- It does not replace complete getters, fixed batch operations, compact bulk transfer, change tracking, or other mechanisms suited to different access patterns.
- An ID or reference to data managed elsewhere is not followed automatically. The query returns that value or reference as a whole unless the project designs a separate API for the referenced data.

## Why this boundary remains valid

The values covered by this design are finite and non-recursive in Taffy 0.13.0, the version currently pinned by TaffyJS.

- [`Layout`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/layout.rs#L223-L248) contains numbers and fixed Point, Size, and Rect records.
- [`DetailedLayoutInfo`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/layout.rs#L349-L360) currently contains either no details or a Grid value. The Grid details contain fixed records and arrays of fixed records or numbers rather than another DetailedLayoutInfo value.
- Style contains fixed records, tagged variants, and collections, but those collections have bounded element shapes. For example, [`GridTemplateComponent::Repeat`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/grid.rs#L1442-L1489) contains a list of TrackSizingFunction values rather than another list of GridTemplateComponent values. CSS Grid also specifies that [`repeat()` cannot be nested](https://www.w3.org/TR/css-grid/#repeat-notation).

Two related structures are recursive, but neither is embedded in these per-node values. The Taffy node tree refers to children through NodeId and belongs to the tree API. CSS math functions such as `calc()`, `min()`, `max()`, and `clamp()` have a recursive [calculation-tree model](https://www.w3.org/TR/css-values-4/#calc-internal), but [Taffy stores a calc value as a reference resolved by the surrounding tree implementation](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/dimension.rs#L57-L64), not as an expression tree inside Style.

New layout features may add fields, variants, collections, or relationships between nodes without making a per-node Style or Layout recursively contain itself. Those changes can extend the explicit selector list without changing this model. If TaffyJS later exposes a genuinely recursive value such as a raw CSS expression tree or layout-fragment tree, the existing query can return the whole value or a reference to it without descending recursively, or that new value can receive a separately designed API.

## Deferred implementation decisions

This design does not yet decide:

- the public method names or exact TypeScript signatures;
- the selector spelling or first public selector list;
- the source format for the canonical selector list;
- private operation numbering or the native method signatures;
- index validation, out-of-bounds, inactive-variant, null, and error behavior;
- whether multi-value or batch reads are justified;
- the benchmark workloads and acceptance thresholds for shipping the API.

Those choices should be made during implementation work without reopening the bounded per-node design unless new evidence shows that the boundary cannot serve a real consumer.
