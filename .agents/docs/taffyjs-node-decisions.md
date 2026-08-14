# @taffyjs/node Decisions

This ledger keeps only judgments Yunfei explicitly expressed; an implementation, passing test or review, resemblance to another project, or silence is not acceptance. Current conversion details belong in [binding mapping](binding-mapping.md), and public behavior belongs in source declarations, JSDoc, README examples, and tests.

## Direct high-level binding

[VOUCHED @hyfdev 2026-08-14]

`@taffyjs/node` is the thin native foundation for Taffy's high-level `TaffyTree` workflow. Rust and Taffy own layout state and behavior; JavaScript must not maintain a shadow tree or reimplement layout. Thin does not mean exposing every public Rust symbol: low-level custom-tree traits, cache internals, CSS parsing, and Yoga compatibility stay outside this package.

Additive convenience or measured performance APIs may coexist with the direct methods, but they must not replace them or require callers to adopt a higher-level JavaScript abstraction.

## Safe boundary with Taffy-owned semantics

[VOUCHED @hyfdev 2026-08-14]

Supported `@taffyjs/node` calls must prevent JavaScript-controlled values, ownership mistakes, callback re-entry, and known Taffy panic paths from violating Rust or native state. Expected misuse produces controlled JavaScript errors. Direct platform-package use is an unsupported implementation path and does not receive this guarantee.

After the binding has produced a complete representable Rust value and satisfied its explicit identity, absence, ownership, lifetime, and safety rules, Taffy owns the semantic result. The direct binding does not add JavaScript-side clamping, CSS policy, Yoga normalization, or defensive defaults merely because a safely representable value is unusual.

## Public data model

[VOUCHED @hyfdev 2026-08-14]

Readable ordinary JavaScript data objects are the default input and output representation. Input record properties and helper-produced objects remain mutable. Collection-valued inputs accept readonly arrays because the binding only reads them; ordinary mutable arrays remain valid inputs. Binding-produced snapshots are detached and recursively readonly in TypeScript, but runtime objects are not frozen, sealed, proxied, cached, or backed by a live Rust borrow.

Closed fieldless families use singular PascalCase frozen objects with stable numeric literal members, such as `Display.Flex`. Payload variants use ordinary numeric-tagged records. Semantic lengths, available space, geometry, alignment, and Grid compose these rules rather than introducing strings, packed values, native owner objects, or CSS grammar.

`StyleInput` uses defaults for missing or `undefined` fields, explicit `null` only for publicly nullable fields, strict top-level and partial-geometry field names, and complete replacement in `setStyle`. `getStyle` and measure callbacks receive complete eager snapshots. A measured future optimization may be additive; no selector, query, lazy object, or output cache belongs to the baseline.

## Value-based NodeId

[VOUCHED @hyfdev 2026-08-14]

Public `NodeId` is an opaque bigint with a TypeScript marker and a private per-tree encoding, not Taffy's raw `u64` and not a JavaScript node object. Stable bigint equality must work in ordinary JavaScript collections without a native call.

The public wrapper keeps one current-node registry and validates owner, creation serial, and raw ID before native access. Native code does not duplicate that registry. IDs are not persistent or transferable across trees, workers, module evaluations, or separately installed package copies.

## Explicit layout and JavaScript context

[VOUCHED @hyfdev 2026-08-14]

Layout computation stays explicit through separate `computeLayout` and `computeLayoutWithMeasure` methods. Layout getters return Taffy's stored value without computing, and `isDirty` keeps Taffy's cache-state meaning rather than promising current output.

Arbitrary node context remains owned by JavaScript; native `TaffyTree<()>` stores only presence. `undefined` means absence, `setNodeContext` marks the node dirty, and in-place context or captured-data changes require caller-managed `markDirty` when they affect measurement. The initial implementation has no JavaScript cache of Taffy-owned data.

## Measurement boundary

[VOUCHED @hyfdev 2026-08-14]

The direct measure callback is synchronous, scoped to one compute, and receives owned boundary values. Taffy and its cache control invocation count, ordering, and constraints. Same-tree native access while it runs fails with `ERR_TAFFY_TREE_BUSY`; an independent tree remains usable.

The callback returns a complete numeric size. The first thrown value or invalid result stops later JavaScript callbacks, lets Taffy's infallible stack finish, invalidates the requested subtree, and is thrown synchronously. The tree remains reusable, but JavaScript side effects and Layout work completed before failure are not rolled back.

Retained, asynchronous, off-thread, cancellable, or transactionally rolled-back measurement would be a different API with its own ownership and failure contract.

## Package and testing boundaries

The public package is ESM-only. napi-rs supplies the private root loader and optional platform packages; do not add a generic intermediate binding package, a dedicated CommonJS build, or a custom loader without a concrete supported-consumer need.

JavaScript integration tests are the primary proof of public behavior. The repository does not maintain a tarball-install path or packed-consumer test while installing packed tarballs directly from this repository is not a supported scenario. Rust unit tests are reserved for small critical behavior that is clearer below Node-API, including panic containment and measurement internals. Test volume is not a goal; preserve distinct behavior without multiplying methods by every equivalent error case.

## Parallel test scheduling

[VOUCHED @hyfdev 2026-08-14]

Test tasks, test files, and independent tests within a file run in parallel by default. Serial execution is allowed only for a demonstrated shared-state or exclusive-resource dependency that cannot cheaply be removed. Keep that exception in its own `*.sequential.test.mts` file, and make the file explicitly opt out of concurrent execution; do not slow a general test command to accommodate one serial case.

## Reopen only with evidence

[VOUCHED @hyfdev 2026-08-14]

New public state owners, compatibility layers, retained JavaScript values, callback models, private transports, batching, caches, or output representations require a concrete consumer need. Performance changes additionally require retained end-to-end measurements that include JavaScript conversion cost. Open work is tracked in [API alignment TODOs](api-alignment-todos.md).
