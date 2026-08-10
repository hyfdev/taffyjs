# @taffyjs/node API Alignment TODOs

This is the source inventory for later alignment between Taffy 0.13's high-level layout API and @taffyjs/node. A checkbox means that the capability still needs an explicit JavaScript design and comparison; it does not require symbol-for-symbol method parity or prescribe a public name.

The current baseline is Taffy 0.13.0 with its default `std`, `taffy_tree`, `flexbox`, `grid`, `block_layout`, `float_layout`, `calc`, `content_size`, and `detailed_layout_info` features. Apply the rules in [Taffy-to-Node binding mapping](binding-mapping.md) before choosing a representation.

This record deliberately does not define the alignment workflow, sequencing, evidence requirements, or acceptance criteria. Those will be designed after the overall mapping rules are complete.

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
- [ ] Normalize every operation's other caller-supplied inputs before its final current-node lookup, then call native synchronously with already-normalized values; otherwise reopen the JS-only validation decision.
- [ ] Align `new_leaf`, `new_leaf_with_context`, and `new_with_children` so native creation and JavaScript registration produce no partially created public state.
- [ ] Align `remove` so native topology changes, JavaScript context deletion, and NodeId-registry deletion cannot report success while leaving the wrapper and native tree inconsistent.
- [ ] Generate an independent, cryptographically secure tree token of at least 128 bits for every tree, fail tree construction if generation fails, and never fall back to a module-local counter; keep the token collision-resistant rather than claiming mathematical uniqueness.
- [ ] Add declaration fixtures proving that returned NodeIds carry the private phantom type marker and that ordinary bigint variables, numbers, and objects are rejected by TypeScript without an explicit assertion.
- [ ] Add runtime fixtures for malformed bigints, cross-tree NodeIds, removed NodeIds, raw Taffy ID reuse, `clear`, and an input conversion that changes tree state before the final current-node lookup; assert controlled errors before Taffy receives an invalid ID.
- [ ] Add identity fixtures proving that repeated retrieval of one current node works with `===`, `Map`, `Set`, and `includes`, while equality alone does not claim that a removed node remains usable.

## Tree topology

- [ ] Align `add_child`, `insert_child_at_index`, `set_children`, `remove_child`, `remove_child_at_index`, `remove_children_range`, and `replace_child_at_index` by capability rather than mechanically copying Rust overloads and range syntax.
- [ ] Align `child_at_index`, `parent`, and `children` reads with stable bigint NodeIds and owned JavaScript collections.
- [ ] Define JavaScript index and range shapes with safe-integer, bounds, and allocation validation.
- [ ] Define reparenting, duplicate-child, self-parent, cycle, and cross-tree behavior before forwarding any topology mutation to Taffy.
- [ ] Make every multi-node mutation validate completely before its first state change and define an atomic failure boundary where Taffy's method sequence is not itself atomic.

## Style

- [ ] Inventory every active `Style<DefaultCheapStr>` field and its nested transitive types under the repository's pinned Taffy feature set.
- [ ] Align style construction and `set_style` through a complete binding-local conversion that applies documented defaults and rejects unsupported variants before mutation.
- [ ] Align `style` reads, if exposed, as owned snapshots with no live JavaScript view of native state.
- [ ] Choose the baseline Style representation and separately evaluate whether a reusable native or preconverted Style path is justified by measured conversion cost.
- [ ] Define missing, `undefined`, `null`, unknown-property, and partial-style behavior explicitly.
- [ ] Preserve the meanings of custom grid identifiers and nested grid collections without leaking Taffy's generic string or compact-storage implementation.

## Layout computation and observable state

- [ ] Implement the vouched `computeLayout({ root, availableSpace })` signature with a validated root NodeId, controlled errors, and explicit computation rather than triggering it from layout reads or mutations.
- [ ] Implement the vouched `computeLayoutWithMeasure({ root, availableSpace, measure })` signature and its single owned readonly callback-input object containing `knownDimensions`, `availableSpace`, `node`, `context`, and `style`; keep callback-failure handling on the controlled path and defer the resulting tree, layout, and cache state to the explicit containment decision below.
- [ ] Define callback exception and invalid-result containment after the public measurement model is selected, including the resulting layout, cache, node-context, and external-side-effect semantics without selecting an implementation mechanism in advance.
- [ ] Align rounded `layout` and `unrounded_layout` as owned snapshots of the values currently stored by Taffy, including zero before the first computation and earlier results until another computation.
- [ ] Decide whether to expose `mark_dirty` and `dirty`; if exposed, retain Taffy's cache-state behavior and do not present `dirty(node)` as proof that the node's stored layout is current.
- [ ] Evaluate readonly TypeScript fields and runtime sealing or freezing for owned Layout snapshots without assuming that either runtime cost is free.
- [ ] Keep any helper that computes before reading or promises a current result separate from the direct baseline API.
- [ ] Decide whether and how to expose `DetailedLayoutInfo` from the currently enabled feature.
- [ ] Define reads after callback failure and after an unexpected internal failure; ordinary reads before computation and after style changes follow Taffy's stored-layout behavior.

## Measurement and node context

- [ ] Implement the vouched `TaffyTree<()>` boundary: use `Some(())` only as a context-presence marker, keep actual values in a wrapper-owned registry keyed by public NodeId, reconstruct that NodeId from the raw ID supplied during measurement, and never retain a JavaScript value or a second context identifier in Rust.
- [ ] Normalize `undefined` context to absence on every creation and update path, clearing both the JavaScript registry entry and Taffy's unit presence marker; return `undefined` for absence while preserving `null` and other values as present contexts.
- [ ] Decide how the capabilities of `set_node_context`, `get_node_context`, `get_node_context_mut`, and `get_disjoint_node_context_mut` appear at the JavaScript boundary, are absorbed into the measurement design, or are intentionally omitted; direct mutable context access must not bypass dirty propagation or native lifetime rules.
- [ ] Preserve Taffy's direct high-level role of one synchronous measure dispatcher per compute call; evaluate a retained per-node callback separately as a convenience pattern demonstrated by iocraft and Ink rather than treating it as the literal Rust API.
- [ ] Define dirtying responsibility for binding-owned callback or node-context changes and for measurement inputs captured outside the binding, because Taffy's cache key does not include callback or context identity and a per-compute callback change does not invalidate cached measurements automatically.
- [ ] Materialize the selected `knownDimensions`, `availableSpace`, public `node`, `context`, and `style` callback fields as owned JavaScript boundary values without exposing Rust borrows, raw Taffy IDs, or raw owner pointers.
- [ ] Define validation for callback output, including missing axes, NaN, infinity, negative values, and the supported `f32` range and precision policy.
- [ ] Define how a JavaScript exception or invalid callback result becomes a controlled JavaScript error despite Taffy's infallible measure closure, including when computation stops and when native state may be reused.
- [ ] Define the measure callback type using only allowed owned inputs and document that same-tree native operations are unavailable until it returns; keep NodeId value operations and another tree usable.
- [ ] Implement the vouched native checked-borrow boundary with shared `&self` napi-rs receivers and one `RefCell` containing `TaffyTree<()>` and any future native state governed by the same access rule; use `try_borrow` or `try_borrow_mut` on every native operation and do not add a duplicate JavaScript busy flag.
- [ ] Map failed same-tree checked borrows to an ordinary JavaScript `Error` with stable code `ERR_TAFFY_TREE_BUSY` and a diagnostic message naming the attempted operation and explaining that the tree cannot be accessed while it is computing layout from a measure callback; never silently ignore the operation or return `undefined`.
- [ ] Add integration fixtures for same-tree read, mutation, removal, and nested computation attempts from a measure callback; assert the stable error code, no panic or partial JavaScript registry update, continued use after the callback failure policy permits it, and successful access to a different tree.
- [ ] Use scoped `Function` for one-call callbacks and consider `FunctionRef` only if a separate retained-callback API is approved; keep actual JavaScript node-context values in the wrapper-owned registry.
- [ ] Account for per-measurement Node-API crossings and argument/result conversions before proposing additive callback or batching optimizations.
- [ ] Track whether Taffy gains a fallible measurement mechanism that can represent JavaScript callback failure more directly.

## Value families

- [ ] Map each required concrete `Size<T>`, `Rect<T>`, `Point<T>`, and `Line<T>` instantiation independently while allowing truthful TypeScript generic helpers.
- [ ] Choose an explicit stable JavaScript vocabulary for fieldless style enums and reject every unknown value.
- [ ] Choose unambiguous semantic representations for `AvailableSpace`, `Dimension`, `LengthPercentage`, `LengthPercentageAuto`, grid placement, grid repetition, and track sizing.
- [ ] Keep `CompactLength` bits, raw tags, unsafe constructors, raw pointers, and calc handles out of the JavaScript boundary.
- [ ] Decide whether calc is unsupported initially or receives a separate owned expression and resolver design.
- [ ] Apply checked `f64`-to-`f32`, integer, collection-length, and range conversions according to each property's semantic domain.
- [ ] Define finite and non-finite layout output behavior rather than relying on incidental JavaScript number conversion.

## Errors, ownership, and environment lifetime

- [ ] Define stable binding-level error categories for malformed values, malformed bigints presented as NodeIds, removed NodeIds, NodeIds created by another tree, topology violations, indices and ranges, measurement failures other than the vouched `ERR_TAFFY_TREE_BUSY`, ordinary Taffy errors, and unexpected internal failures.
- [ ] Audit every selected Taffy method for indexing, `unwrap`, range panic, partial mutation, and other preconditions that `TaffyResult` does not enforce in Taffy 0.13.
- [ ] Define the native tree's state after every expected and unexpected failure, including whether stored layouts and caches remain readable or reusable and what recovery, if any, is required.
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
