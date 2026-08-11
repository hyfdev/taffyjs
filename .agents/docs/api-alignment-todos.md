# @taffyjs/node API Alignment TODOs

This is the source inventory for later alignment between Taffy 0.13's high-level layout API and @taffyjs/node. A checkbox means that the capability still needs an explicit JavaScript design and comparison; it does not require symbol-for-symbol method parity or prescribe a public name.

The current baseline is Taffy 0.13.0 with its default `std`, `taffy_tree`, `flexbox`, `grid`, `block_layout`, `float_layout`, `calc`, `content_size`, and `detailed_layout_info` features. Apply the rules in [Taffy-to-Node binding mapping](binding-mapping.md) before choosing a representation.

This record deliberately remains the design-stage capability inventory. The exhaustive method-by-method API, Style-field, acceptance, test, sequencing, review, and finish contract is now drafted in [@taffyjs/node maturity loop goal](loop-goal.md). That contract remains inert until Yunfei vouches the whole file; once vouched, it governs implementation and this file remains supporting design history rather than a second execution checklist.

## Native owner and configuration

- [ ] Align construction and capacity configuration from `TaffyTree::new` and `TaffyTree::with_capacity`, including checked JavaScript integer handling and whether capacity belongs in the baseline surface.
- [ ] Align rounding configuration from `enable_rounding` and `disable_rounding` without exposing writable native fields.
- [ ] Align `clear` with NodeId-registry clearing and deletion of all wrapper-owned JavaScript context entries.
- [ ] Align observable tree metadata such as `total_node_count` where it supports normal layout usage.

## Node identity and lifecycle

- [ ] Implement a bigint `NodeId` with the private TypeScript `phantomMarker` and an authored public JavaScript `TaffyTree` wrapper that stores the native tree in `#inner` and keeps all raw native operations private.
- [ ] Choose the private composite NodeId field layout and allocation mechanism for the binding-issued node serial and raw Taffy NodeId without making any field a public persistence or arithmetic format.
- [ ] Implement a private per-tree `raw NodeId -> current serial` registry with expected constant-time lookup and one entry for each node still stored in Taffy.
- [ ] Keep TaffyTree as the sole layout-state owner without a JavaScript shadow tree, reimplemented layout abstraction, or JavaScript implementation of Taffy's low-level tree traits.
- [ ] Make every supported NodeId-consuming path validate the bigint's form, tree identity, raw Taffy NodeId, and current serial in JavaScript immediately before its synchronous native call, with no exported bypass through @taffyjs/node.
- [ ] Perform the wrapper's single current-node lookup immediately before its synchronous native call in the ordinary value-object path; do not add another lookup or a dedicated defensive copy solely for accessor or Proxy re-entry, and reopen JS-only validation if a normal supported operation executes application code after the lookup.
- [ ] Align `new_leaf`, `new_leaf_with_context`, and `new_with_children` so native creation and JavaScript registration produce no partially created public state.
- [ ] Align `remove` so native topology changes, JavaScript context deletion, and NodeId-registry deletion cannot report success while leaving the wrapper and native tree inconsistent.
- [ ] Generate an independent, cryptographically secure tree token of at least 128 bits for every tree, fail tree construction if generation fails, and never fall back to a module-local counter; keep the token collision-resistant rather than claiming mathematical uniqueness.
- [ ] Add declaration fixtures proving that returned NodeIds carry the private phantom type marker and that ordinary bigint variables, numbers, and objects are rejected by TypeScript without an explicit assertion.
- [ ] Add runtime fixtures for malformed bigints, cross-tree NodeIds, removed NodeIds, raw Taffy ID reuse, and `clear`; assert controlled errors before Taffy receives an invalid ID without adding a getter- or Proxy-re-entry fixture to the baseline contract.
- [ ] Add identity fixtures proving that repeated retrieval of one current node works with `===`, `Map`, `Set`, and `includes`, while equality alone does not claim that a removed node remains usable.

## Tree topology

- [ ] Align `add_child`, `insert_child_at_index`, `set_children`, `remove_child`, `remove_child_at_index`, `remove_children_range`, and `replace_child_at_index` by capability rather than mechanically copying Rust overloads and range syntax.
- [ ] Align `child_at_index`, `parent`, and `children` reads with stable bigint NodeIds and owned JavaScript collections.
- [ ] Define JavaScript index and range shapes with safe-integer, bounds, and allocation validation.
- [ ] Define reparenting, duplicate-child, self-parent, cycle, and cross-tree behavior before forwarding any topology mutation to Taffy.
- [ ] Make every multi-node mutation validate completely before its first state change and define an atomic failure boundary where Taffy's method sequence is not itself atomic.

## Style

- [ ] Inventory every active `Style<DefaultCheapStr>` field and its nested transitive types under the repository's pinned Taffy feature set.
- [ ] Implement the selected ordinary camelCase `StyleInput`: every field is optional, missing and explicit `undefined` apply the corresponding `Style::DEFAULT` value, fixed-shape `Point`, `Size`, `Rect`, and `Line` Style fields are partial input records whose omitted components use the corresponding enclosing Style default, `null` explicitly maps to `None` only for a publicly nullable field and is rejected elsewhere, and unknown enumerable string fields or partial-record components produce a controlled error.
- [ ] Implement `setStyle` as construction and replacement of one complete Style rather than a merge with stored state; reject unsupported variants before mutation and do not expose calc while high-level `TaffyTree` resolves it to zero without an application resolver.
- [ ] Expose baseline `getStyle(node)` and each actual measure callback's `style` as separately owned complete eager ordinary plain-object snapshots with every recursively readonly TypeScript field present, `Some(value)` represented as the concrete value, and `None` represented as `null` rather than a missing or `undefined` field; do not freeze, seal, proxy, or cache those runtime objects.
- [ ] Keep mutable plain ordinary `StyleInput` objects as the selected input declaration and runtime baseline without special accessor or Proxy defenses.
- [ ] Add runtime and declaration fixtures for missing versus explicit `undefined`, partial fixed-shape records filled from the enclosing Style default rather than stored state, `null` on nullable and nonnullable fields, exact-optional-property TypeScript consumers, property-level JSDoc wherever `null` and `undefined` differ, unknown top-level and partial-record fields, full replacement, calc rejection, complete eager output, detached runtime mutation, recursive readonly declarations, and absence of runtime freeze.
- [ ] Preserve the meanings of custom grid identifiers and nested grid collections without leaking Taffy's generic string or compact-storage implementation.

Output materialization optimizations are intentionally absent from this implementation checklist. The completed lazy, selective-read, prepared-query, batching, and callback-delivery research is preserved in [Output optimization research](output-optimization-research.md); none becomes implementation work until a measured consumer workload explicitly reopens it.

## Layout computation and observable state

- [ ] Implement the vouched `computeLayout({ root, availableSpace })` signature with a validated root NodeId, controlled errors, and explicit computation rather than triggering it from layout reads or mutations.
- [ ] Implement the vouched `computeLayoutWithMeasure({ root, availableSpace, measure })` signature and its single owned readonly callback-input object containing `knownDimensions`, `availableSpace`, `node`, `context`, and `style`; apply the vouched synchronous callback-failure boundary below.
- [ ] On the first callback exception or invalid return, stop invoking user JavaScript, drain Taffy's infallible measure stack with internal zero sizes, invalidate the requested root subtree's caches, propagate the first failure synchronously, keep the tree reusable, and do not promise Layout or JavaScript-side-effect rollback.
- [ ] Align rounded `layout` and `unrounded_layout` as owned snapshots of the values currently stored by Taffy, including zero before the first computation and earlier results until another computation.
- [ ] Expose `markDirty(node)` and `isDirty(node)` as direct mappings of Taffy's node-and-ancestor invalidation and per-node dirty-cache query without adding another layout-freshness policy.
- [ ] Use readonly TypeScript fields for owned Layout snapshots and evaluate runtime sealing or freezing separately without assuming that its cost is free.
- [ ] Keep any helper that computes before reading or promises a current result separate from the direct baseline API.
- [ ] Decide whether and how to expose `DetailedLayoutInfo` from the currently enabled feature.
- [ ] After expected callback failure, keep reads on Taffy's ordinary stored-layout behavior while treating the attempted subtree as dirty until another successful compute; define unexpected internal-failure behavior separately.

## Measurement and node context

- [ ] Implement the vouched `TaffyTree<()>` boundary: use `Some(())` only as a context-presence marker, keep actual values in a wrapper-owned registry keyed by public NodeId, reconstruct that NodeId from the raw ID supplied during measurement, and never retain a JavaScript value or a second context identifier in Rust.
- [ ] Normalize `undefined` context to absence on every creation and update path, clearing both the JavaScript registry entry and Taffy's unit presence marker; return `undefined` for absence while preserving `null` and other values as present contexts.
- [ ] Expose the selected `newLeafWithContext`, `getNodeContext`, and `setNodeContext` context surface with exact caller-owned JavaScript value identity; do not expose Rust's separate mutable-context borrow helpers.
- [ ] Preserve Taffy's direct high-level role of one synchronous measure dispatcher per compute call; evaluate a retained per-node callback separately as a convenience pattern demonstrated by iocraft and Ink rather than treating it as the literal Rust API.
- [ ] Make `setNodeContext` always dirty the node, require callers to use `markDirty` after in-place context or externally captured measurement-data changes, and do not treat a different per-compute callback object as automatic cache invalidation.
- [ ] Materialize the selected `knownDimensions`, `availableSpace`, public `node`, `context`, and `style` callback fields as owned JavaScript boundary values without exposing Rust borrows, raw Taffy IDs, or raw owner pointers.
- [ ] Require a synchronous complete `SizeInput<number>` callback result, reject unsupported shapes, missing or incorrectly typed axes, unknown geometry components, and Promises with ordinary `TypeError`, and apply scalar `f32` pass-through to every JavaScript-number axis.
- [ ] Preserve callback-thrown JavaScript values without a binding wrapper, give malformed results no dedicated stable error code, avoid further user callback calls after the first failure, and avoid whole-tree rollback cloning or Rust-panic control flow.
- [ ] Document the measure callback as a Taffy-controlled query without stable invocation-count or cross-node-order guarantees; preserve direct callback-side context mutation without automatic invalidation, and require caller invalidation after the compute only when that mutation changes future measurement semantics.
- [ ] Define the measure callback type using only allowed owned inputs and document that same-tree native operations are unavailable until it returns; keep NodeId value operations and another tree usable.
- [ ] Implement the vouched native checked-borrow boundary with shared `&self` napi-rs receivers and one `RefCell` containing `TaffyTree<()>` and any future native state governed by the same access rule; use `try_borrow` or `try_borrow_mut` on every native operation and do not add a duplicate JavaScript busy flag.
- [ ] Map failed same-tree checked borrows to an ordinary JavaScript `Error` with stable code `ERR_TAFFY_TREE_BUSY` and a diagnostic message naming the attempted operation and explaining that the tree cannot be accessed while it is computing layout from a measure callback; never silently ignore the operation or return `undefined`.
- [ ] Add integration fixtures for same-tree read, mutation, removal, and nested computation attempts from a measure callback; assert the stable error code, no panic or partial JavaScript registry update, continued use after the callback failure policy permits it, and successful access to a different tree.
- [ ] Use scoped `Function` for one-call callbacks and consider `FunctionRef` only if a separate retained-callback API is approved; keep actual JavaScript node-context values in the wrapper-owned registry.
- [ ] Account for per-measurement Node-API crossings and argument/result conversions before proposing additive callback or batching optimizations.
- [ ] Track whether Taffy gains a fallible measurement mechanism that can represent JavaScript callback failure more directly.

## Value families

- [ ] Define complete mutable `PointInput<T>`, `SizeInput<T>`, `RectInput<T>`, and `LineInput<T>` records with their vouched named components, Style-only partial mutable `Partial*Input<T>` forms with explicit `undefined`, and complete binding-produced readonly unsuffixed `Point<T>`, `Size<T>`, `Rect<T>`, and `Line<T>` forms; do not spread Style defaulting into complete inputs such as available space or measure results.
- [ ] Map each required concrete geometry instantiation independently behind the truthful TypeScript generics, compose the separately selected payload representation in every component, and keep tuples, arrays, positional constructors, native input owners, extra `Rect` aliases, and generic `Point` or `Line` scalar expansion outside the public vocabulary.
- [ ] Add geometry declaration and conversion fixtures for exact component names, Style partial defaults, complete non-Style inputs, complete readonly output, output-to-input reuse, unknown-component and array rejection, and the existing semantic-length-only `Size` and `Rect` one-value form.
- [ ] Implement fieldless Style enums as binding-owned stable integer codes exposed through immutable numeric-literal constant families; export shared `EnumValue<Family>` inference, use the same singular PascalCase name for each public family object and type, use PascalCase members such as `Display.None`, and make analogous enum-like families follow this convention unless an explicit external compatibility contract fixes another spelling.
- [ ] Add declaration tests that accept named members and equivalent raw numeric literals, reject unknown literals and widened general numbers, document structural acceptance when another family shares a code, and prove that tagged records narrow through ordinary comparison with both named constants and raw literals; require documentation, JSDoc, examples, and repository code to use named members and label raw-literal boundary examples as not recommended; add runtime tests that reject non-finite, fractional, and unknown numeric values before mutation.
- [ ] Encapsulate shared enum-member inference once and select one authoritative definition path that derives public constants, declarations, native validation, and Taffy conversion matches without separately handwritten member lists.
- [ ] Implement `AlignItems` and `AlignContent` as flattened numeric-literal families with the vouched named member sets; share `AlignItems` across the item/self Style aliases and `AlignContent` across the content aliases without creating alias-specific code sets.
- [ ] Add alignment declaration, conversion, nullable round-trip, `SafeStart` preservation, and `SafeCenter` overflow fixtures; reject unknown codes before mutation and keep strings, raw keyword-safety records, invalid `Safe*` products, and redundant `Unsafe*` names outside the public vocabulary.
- [ ] Implement `Dimension`, `LengthPercentage`, and `LengthPercentageAuto` as ordinary records tagged by the numeric-literal `LengthUnit` family, with `Dimension.Length(value)`, `Dimension.Percent(value)`, and `Dimension.Auto` conveniences, user-facing percentage magnitudes, readonly canonical output, and no string, bare-number, compact-storage, or calc representation.
- [ ] Add semantic-length fixtures for direct records and `Dimension` conveniences, exact unit validation, required length and percent payloads, ignored extra structural properties on Auto input, 50-to-0.5 percent conversion, stored-value output with shared-unit switch narrowing and direct output-to-input round-trip, negative and non-finite pass-through, string and bare-number rejection, homogeneous `Rect` and `Size` expansion, partial records, and complete output.
- [ ] Implement `AvailableSpaceInput` and `AvailableSpace` as ordinary records tagged by the numeric-literal `AvailableSpaceKind` family, with `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent` conveniences, mutable direct input, readonly callback output, and no bare-number, string, symbol, reserved-number, or packed representation.
- [ ] Add `AvailableSpace` fixtures for direct records and conveniences, runtime rejection of unknown kind codes, declaration acceptance of valid raw kind literals, rejection of unknown literals and widened numbers, structural acceptance of same-code members from another family, required definite payloads, ignored extra structural properties on content input, scalar precision and non-finite pass-through, rejection of unsupported whole-value representations, complete geometry input, readonly callback output, ordinary narrowing, and round-trip reuse.
- [ ] Implement the selected Grid mapping: numeric-literal `GridAutoFlow`; numeric-tagged placement conveniences and partial `Line` fields; complete min/max track pairs with numeric-literal `TrackSizingKind` variants and Taffy-normalized conveniences; numeric-tagged repetition counts and template components; complete repetition and template-area records; ordinary strings; mutable nested input arrays; and recursively readonly canonical output.
- [ ] Apply finite exact `i16` or `u16` representability checks to Grid integer payloads without semantic clamping, keep floating payloads on the selected pass-through boundary, do not validate CSS custom-ident grammar or copy Taffy's internal 10,000-track cap, and forward safely representable semantic edge cases to Taffy after auditing concrete collection shapes for panics; specifically reject the pinned named-line-resolver combination of a reachable positive repetition with empty internal line names or safely supply its semantically empty expected line-name sets.
- [ ] Add Grid declaration and integration fixtures for every discriminator and convenience, partial line defaults, complete pair normalization, output without helper history, percentage conversion, integer boundaries and zero pass-through, arbitrary strings, nested collections, nullable template areas, recursive readonly output, ignored unrelated tagged-branch properties without optional-`never` exclusions, complete conversion before replacement, both-axis regressions for the pinned empty-repeat-line-names underflow, and other known panic cases.
- [ ] Keep `CompactLength` bits, raw tags, unsafe constructors, raw pointers, and calc handles out of the JavaScript boundary.
- [ ] Keep calc unsupported in the public high-level Style vocabulary while `TaffyTree` resolves it to zero without an application resolver; decide only whether Cargo also disables the internal feature.
- [ ] Apply the selected JavaScript-number-only scalar boundary and ordinary `f64`-to-`f32` rounding without requiring exact representation or retaining original input precision.
- [ ] Pass Rust-representable floating-point values through without property-domain checks, clamping, normalization, or default substitution; keep exact-integer, collection-length, allocation, and range safety checks separate.
- [ ] Return Taffy's actual finite or non-finite Style and Layout `f32` values through ordinary widening to JavaScript numbers without sanitizing them for JavaScript or JSON.

## Errors, ownership, and environment lifetime

- [ ] Define stable binding-level error categories for malformed values, malformed bigints presented as NodeIds, removed NodeIds, NodeIds created by another tree, topology violations, indices and ranges, ordinary Taffy errors, and unexpected internal failures; callback-thrown values propagate directly, malformed measure results use ordinary `TypeError`, and same-tree re-entry retains `ERR_TAFFY_TREE_BUSY`.
- [ ] Audit every selected Taffy method for indexing, `unwrap`, range panic, partial mutation, and other preconditions that `TaffyResult` does not enforce in Taffy 0.13.
- [ ] Apply the vouched reusable-tree, subtree-cache-invalidation, and nontransactional stored-Layout behavior after expected callback failure; define other expected and unexpected failure states separately.
- [ ] Define Node environment and worker boundaries for the public wrapper, private native class, retained references, destruction, and any future cross-thread API; NodeIds themselves remain local to the exact TaffyTree that issued them.
- [ ] Test that a NodeId cloned to another worker or produced by a separately evaluated or installed @taffyjs/node copy does not gain transfer semantics and is rejected by another tree's ordinary runtime check.
- [ ] Prove that retained callback and context state cannot cross the originating Node environment or thread, using type-level non-sendability and compile-time assertions where the chosen representation permits them.
- [ ] Keep panic containment as a defensive backstop rather than the normal path for invalid JavaScript input or callback errors.

## Optional and additive surfaces

- [ ] Decide whether `print_tree` belongs in the public package, a debug-only surface, or no JavaScript API.
- [ ] Treat parsing, serde-based transport, low-level tree traits, trait-dependent algorithms, cache internals, and JavaScript-owned custom trees as out of scope unless a new requirement explicitly expands the package boundary.
- [ ] Track batch node creation, batch topology mutation, batch layout reads, reusable converted styles, and other measured performance APIs as additive candidates that cannot replace the direct baseline.
- [ ] Keep JavaScript caches for Style, Layout, parent, children, and other Taffy-owned data out of the initial implementation; require a separate measured design with complete invalidation rules before adding one.
- [ ] Treat off-thread layout, asynchronous measurement, cancellation, and result delivery as a separate future contract rather than extensions of the synchronous callback API.

## Deferred alignment design

- [ ] Define the source-to-JavaScript alignment process after the mapping rules are complete.
- [ ] Define how alignment work is sequenced and how coverage or intentional omissions are recorded.
- [ ] Define integration and end-to-end acceptance criteria for capability, safety, hostile misuse, declaration accuracy, and visible cost.
- [ ] Define performance evidence and regression thresholds for representations or additive fast paths.
- [ ] Define the dependency-upgrade and feature-change acceptance process beyond the mapping audit already recorded.
