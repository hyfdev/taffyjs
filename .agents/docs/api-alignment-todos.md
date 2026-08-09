# @taffyjs/node API Alignment TODOs

This is the source inventory for later alignment between Taffy 0.13's high-level layout API and @taffyjs/node. A checkbox means that the capability still needs an explicit JavaScript design and comparison; it does not require symbol-for-symbol method parity or prescribe a public name.

The current baseline is Taffy 0.13.0 with its default `std`, `taffy_tree`, `flexbox`, `grid`, `block_layout`, `float_layout`, `calc`, `content_size`, and `detailed_layout_info` features. Apply the rules in [Taffy-to-Node binding mapping](binding-mapping.md) before choosing a representation.

This record deliberately does not define the alignment workflow, sequencing, evidence requirements, or acceptance criteria. Those will be designed after the overall mapping rules are complete.

## Native owner and configuration

- [ ] Align construction and capacity configuration from `TaffyTree::new` and `TaffyTree::with_capacity`, including checked JavaScript integer handling and whether capacity belongs in the baseline surface.
- [ ] Align rounding configuration from `enable_rounding` and `disable_rounding` without exposing writable native fields.
- [ ] Align `clear` with atomic handle invalidation and explicit release of all bridge-owned node-context resources.
- [ ] Align observable tree metadata such as `total_node_count` where it supports normal layout usage.

## Node identity and lifecycle

- [ ] Implement binding-created `External<PrivateNodeHandle>` values for every internal `NodeId`, with a private Node-API type tag, a private branded TypeScript declaration, and no constructible public Node class.
- [ ] Choose how private Rust handle data records which tree created it and how long that record remains valid, without raw references or pointers to a `TaffyTree`.
- [ ] Keep TaffyTree as the sole layout-state owner without a JavaScript shadow tree, reimplemented layout abstraction, or JavaScript implementation of Taffy's low-level tree traits.
- [ ] Define how the binding checks that a node still exists after creation, `remove`, `clear`, owner destruction, and any future key reuse.
- [ ] Align `new_leaf`, `new_leaf_with_context`, and `new_with_children` with complete prevalidation and no partially created public state.
- [ ] Align `remove` with topology updates, context cleanup, deterministic stale-handle behavior, and controlled errors.
- [ ] Decide whether a node handle keeps its tree alive or becomes unusable after the tree wrapper is collected.
- [ ] Add declaration fixtures proving that a returned handle is accepted while an ordinary object and direct construction are rejected.
- [ ] Add runtime fixtures proving that an ordinary object and an External created by an unrelated native addon become controlled JavaScript errors; check the binding's Node-API type tag before napi-rs reads the external data pointer.
- [ ] Decide whether consumers need an explicit node-comparison API and, if so, define its placement and its behavior for handles from different trees and handles whose nodes were removed; do not rely on JavaScript `===` or raw NodeId equality.

## Tree topology

- [ ] Align `add_child`, `insert_child_at_index`, `set_children`, `remove_child`, `remove_child_at_index`, `remove_children_range`, and `replace_child_at_index` by capability rather than mechanically copying Rust overloads and range syntax.
- [ ] Align `child_at_index`, `parent`, and `children` reads with opaque handles and owned JavaScript collections.
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

- [ ] Align `compute_layout` with `Size<AvailableSpace>`, opaque root handles, and controlled errors; keep computation explicit rather than triggering it from layout reads or mutations.
- [ ] Align `compute_layout_with_measure` with synchronous JavaScript measurement and controlled callback-failure semantics that never expose partially computed native state as valid.
- [ ] Define callback exception and invalid-result containment after the public measurement model is selected, including the resulting layout, cache, node-context, and external-side-effect semantics without selecting an implementation mechanism in advance.
- [ ] Align rounded `layout` and `unrounded_layout` as owned snapshots of the values currently stored by Taffy, including zero before the first computation and earlier results until another computation.
- [ ] Decide whether to expose `mark_dirty` and `dirty`; if exposed, retain Taffy's cache-state behavior and do not present `dirty(node)` as proof that the node's stored layout is current.
- [ ] Evaluate readonly TypeScript fields and runtime sealing or freezing for owned Layout snapshots without assuming that either runtime cost is free.
- [ ] Keep any helper that computes before reading or promises a current result separate from the direct baseline API.
- [ ] Decide whether and how to expose `DetailedLayoutInfo` from the currently enabled feature.
- [ ] Define reads after callback failure and after an unexpected internal failure; ordinary reads before computation and after style changes follow Taffy's stored-layout behavior.

## Measurement and node context

- [ ] Choose the concrete `BridgeNodeContext` without conflating per-node context with Taffy's separately supplied measure closure.
- [ ] Decide how the capabilities of `set_node_context`, `get_node_context`, `get_node_context_mut`, and `get_disjoint_node_context_mut` appear at the JavaScript boundary, are absorbed into the measurement design, or are intentionally omitted; direct mutable context access must not bypass dirty propagation or native lifetime rules.
- [ ] Decide whether measurement is supplied once per compute, retained per node, shared with per-node context, or offered through more than one explicit API.
- [ ] Preserve Taffy's direct high-level role of one synchronous measure dispatcher per compute call; evaluate a retained per-node callback separately as a convenience pattern demonstrated by iocraft and Ink rather than treating it as the literal Rust API.
- [ ] Define dirtying responsibility for binding-owned callback or node-context changes and for measurement inputs captured outside the binding, because Taffy's cache key does not include callback or context identity and a per-compute callback change does not invalidate cached measurements automatically.
- [ ] Align known dimensions, available space, node identity, context, observable style input, and measured size without exposing Rust borrows or raw IDs.
- [ ] Materialize callback inputs as owned JavaScript boundary values without exposing Rust borrows or raw owner pointers.
- [ ] Define validation for callback output, including missing axes, NaN, infinity, negative values, and the supported `f32` range and precision policy.
- [ ] Define how a JavaScript exception or invalid callback result becomes a controlled JavaScript error despite Taffy's infallible measure closure, including when computation stops and when native state may be reused.
- [ ] Decide which same-tree operations, if any, a JavaScript measure callback may perform, and define controlled behavior for every rejected operation without allowing overlapping Rust borrows, panic, or corrupted native state.
- [ ] Use scoped `Function` for one-call callbacks and `FunctionRef` only for retained callbacks, with explicit `remove`, `clear`, owner-drop, and Node-environment release behavior.
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

- [ ] Define stable binding-level error categories for malformed values, ordinary objects or foreign native Externals presented as node handles, removed-node handles, handles created by another tree, topology violations, indices and ranges, measurement failures, callback access rejected by the chosen re-entry policy, ordinary Taffy errors, and unexpected internal failures.
- [ ] Audit every selected Taffy method for indexing, `unwrap`, range panic, partial mutation, and other preconditions that `TaffyResult` does not enforce in Taffy 0.13.
- [ ] Define the native tree's state after every expected and unexpected failure without exposing partially reusable layouts or caches.
- [ ] Define Node environment and worker boundaries for classes, handles, retained references, destruction, and any future cross-thread API.
- [ ] Prove that retained callback and context state cannot cross the originating Node environment or thread, using type-level non-sendability and compile-time assertions where the chosen representation permits them.
- [ ] Keep panic containment as a defensive backstop rather than the normal path for invalid JavaScript input or callback errors.

## Optional and additive surfaces

- [ ] Decide whether `print_tree` belongs in the public package, a debug-only surface, or no JavaScript API.
- [ ] Treat parsing, serde-based transport, low-level tree traits, trait-dependent algorithms, cache internals, and JavaScript-owned custom trees as out of scope unless a new requirement explicitly expands the package boundary.
- [ ] Track batch node creation, batch topology mutation, batch layout reads, reusable converted styles, and other measured performance APIs as additive candidates that cannot replace the direct baseline.
- [ ] Treat off-thread layout, asynchronous measurement, cancellation, and result delivery as a separate future contract rather than extensions of the synchronous callback API.

## Deferred alignment design

- [ ] Define the source-to-JavaScript alignment process after the mapping rules are complete.
- [ ] Define how alignment work is sequenced and how coverage or intentional omissions are recorded.
- [ ] Define integration and end-to-end acceptance criteria for capability, safety, hostile misuse, declaration accuracy, and visible cost.
- [ ] Define performance evidence and regression thresholds for representations or additive fast paths.
- [ ] Define the dependency-upgrade and feature-change acceptance process beyond the mapping audit already recorded.
