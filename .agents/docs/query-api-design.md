# Selective Query Design Notes

## Motivation

The direct @taffyjs/node getters return complete owned JavaScript snapshots of Taffy's native values. That is the correct baseline behavior, but it can do unnecessary work when a consumer needs only one field or one value inside a nested collection: native code still walks and converts the unrequested parts of the snapshot before JavaScript discards them.

The proposed addition is a way to read only the requested value. It complements complete getters rather than replacing them. A consumer that needs most of a Style, Layout, or DetailedLayoutInfo value should continue to request the complete snapshot.

## Reference design

A single selective-query request reads one value from one node's Style, Layout, or DetailedLayoutInfo.

- Every value reachable through the public JavaScript shape is queryable. This includes top-level fields, complete intermediate records and tagged variants, their nested fields, collection lengths, individual collection elements, and values below nested collections. Numbers, strings, booleans, enums, IDs, and references to data managed elsewhere end a path rather than opening another object graph.
- Selectors are derived mechanically from that complete public shape rather than admitted through a separately curated list. Adding a reachable field to the public value also adds the corresponding selectors; generation must fail rather than silently leave a public field unqueryable.
- Collection indices are values supplied separately from the selector. Numeric text, wildcards, filters, slices, callbacks, and arbitrary path expressions are not part of the selector language.
- JavaScript resolves the selector through generated static metadata before entering native code. Native code receives a private operation identifier, exhaustively dispatches it, and directly reads and converts the selected Rust value. Native code does not parse the public selector or create a parent JavaScript object and then extract one child.
- One canonical description of the public values keeps the TypeScript calls and result types, JavaScript lookup and index count, and Rust dispatch contract consistent. People decide the public data shape; generation provides complete query coverage for it.

When the selector and indices form a valid query but the current data has no value at that position, the result is `undefined`. This includes an out-of-bounds index, an inactive tagged variant, or attempting to continue below `null`. Querying a nullable field itself still returns its actual `null` value. An unknown selector, the wrong number of indices, or an invalid index is a malformed call and produces a controlled JavaScript error instead.

The single request is also the only model used to define batching. A data kind exposes its single and batch forms through overloads of the same public method name; for example, Style uses `queryStyle` for both rather than adding `queryStyleBatch`. The batch form accepts an ordered collection of ordinary single requests and returns their results in the same order.

Generation defines the valid single-request tuples and their result types once. The batch TypeScript result is derived by mapping those same relationships over the input collection, JavaScript reuses the same selector metadata and validation, and native code reuses the same per-request dispatcher. A private native batch entry may wrap that dispatcher so the complete collection crosses the JavaScript-to-native boundary once; the public batch overload must not be implemented as repeated native calls through the single overload.

A malformed request makes the complete batch throw without returning partial results. Malformed requests include unknown selectors, the wrong number of indices, invalid indices, and invalid, stale, or foreign NodeIds. Valid queries whose current values are absent still produce `undefined` only at their corresponding result positions. Before validation, the wrapper must copy every caller-controlled batch entry and request argument into an ordinary internal snapshot; it then validates the complete snapshot and immediately enters native code, so an accessor or Proxy cannot invalidate an earlier NodeId between validation and native use.

Every selected object or array is an ordinary detached owned snapshot, recursively readonly in TypeScript, with no live view or native borrow. Separate requests do not promise shared JavaScript object identity, including duplicate requests or requests for overlapping parent and child values.

The intended flow is:

```text
single request or ordered batch
  -> generated JavaScript lookup for each request
  -> one private native operation
  -> the same direct per-request Rust dispatch
  -> one result or positionally corresponding results
```

## Boundaries

This design is deliberately smaller than a general query language.

- Each request starts from one NodeId and one kind of per-node data: Style, Layout, or DetailedLayoutInfo.
- A selector may only follow paths generated from the public value shape. It cannot discover or execute an arbitrary path at runtime.
- It does not search, filter, sort, or traverse the Taffy node tree.
- It does not combine unrelated fields into a caller-defined result shape.
- Its batch overload batches selective requests. It does not replace complete getters, complete-object batch operations, [compact complete-output transport](complete-output-transport.md), change tracking, or other mechanisms suited to different access patterns.
- An ID or reference to data managed elsewhere is not followed automatically. The query returns that value or reference as a whole unless the project designs a separate API for the referenced data.

## Why this boundary remains valid

The values covered by this design are finite and non-recursive in Taffy 0.13.0, the version currently pinned by TaffyJS.

- [`Layout`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/layout.rs#L223-L248) contains numbers and fixed Point, Size, and Rect records.
- [`DetailedLayoutInfo`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/layout.rs#L349-L360) currently contains either no details or a Grid value. The Grid details contain fixed records and arrays of fixed records or numbers rather than another DetailedLayoutInfo value.
- Style contains fixed records, tagged variants, and collections, but those collections have bounded element shapes. For example, [`GridTemplateComponent::Repeat`](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/grid.rs#L1442-L1489) contains a list of TrackSizingFunction values rather than another list of GridTemplateComponent values. CSS Grid also specifies that [`repeat()` cannot be nested](https://www.w3.org/TR/css-grid/#repeat-notation).

Two related structures are recursive, but neither is embedded in these per-node values. The Taffy node tree refers to children through NodeId and belongs to the tree API. CSS math functions such as `calc()`, `min()`, `max()`, and `clamp()` have a recursive [calculation-tree model](https://www.w3.org/TR/css-values-4/#calc-internal), but [Taffy stores a calc value as a reference resolved by the surrounding tree implementation](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/dimension.rs#L57-L64), not as an expression tree inside Style.

New layout features may add fields, variants, collections, or relationships between nodes without making a per-node Style or Layout recursively contain itself. Those changes can extend the generated selectors without changing this model. If TaffyJS later exposes a genuinely recursive value such as a raw CSS expression tree or layout-fragment tree, the existing query can return the whole value or a reference to it without descending recursively, or that new value can receive a separately designed API.

## Deferred implementation decisions

This design does not yet decide:

- the exact public method names, TypeScript signatures, or batch request container, beyond the requirement that single and batch forms share one method name;
- the exact selector spelling;
- how the canonical public value shapes are represented for generation;
- private operation numbering, native method signatures, and the concrete private batch entry;
- the supported integer range and exact error classes for malformed calls;
- batch size limits;
- the benchmark workloads and acceptance thresholds for shipping the API.

Those choices should be made during implementation work without reopening the bounded per-node design unless new evidence shows that the boundary cannot serve a real consumer.
