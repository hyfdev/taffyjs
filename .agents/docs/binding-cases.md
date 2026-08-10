# Binding Mapping Cases

These cases start with observable Rust behavior and then derive the JavaScript boundary that can preserve it safely. They explain and test the mapping rules; vouched product judgments remain in [@taffyjs/node decisions](taffyjs-node-decisions.md).

The evidence baseline for this case is Taffy 0.13.0, napi 3.12.0, napi-derive 3.6.2, and @napi-rs/cli 3.8.2.

## Case 1: TaffyTree layout state and node identities

### Rust behavior

`TaffyTree` owns node styles, relationships, cached computations, and stored layouts. A `NodeId` is a copyable numeric slotmap key used to address that state; it is not an independently owned node object and carries no reference to its TaffyTree.

#### Layout reads return stored state

A new node starts with a zero Layout. Calling `layout(node)` before computation returns that stored zero value. Calling `set_style` replaces the Style and marks the node and its ancestors dirty, but it does not compute a new layout. Until the caller invokes `compute_layout`, `layout(node)` continues to return the previous stored result.

The dirty query reports whether that node's own Taffy cache is empty. It is not a complete freshness check. For example, changing a parent can leave a child reporting `dirty == false` even though recomputing the parent will change the child's stored position.

This is a direct API contract rather than an error to repair. An API that computes before reading or promises a current result would be additive sugar with different work and semantics.

#### Layout references cannot cross the boundary

Rust returns `&Layout`, borrowed from the TaffyTree. Rust will not allow the tree to be mutated while that reference remains in use. JavaScript cannot express this borrow, so the binding copies Layout into an owned JavaScript snapshot. Mutating the snapshot never mutates native tree state.

Readonly TypeScript fields and runtime `Object.seal` or `Object.freeze` may make the snapshot's intended use clearer, but their exact behavior and cost remain open.

#### NodeId equality does not include the tree

`NodeId` derives equality from its single stored `u64`. Two separately created TaffyTree instances can issue equal NodeId values. Passing one tree's NodeId to another tree can therefore access the other tree's node when the numeric keys match instead of producing an error. Using a NodeId after removal can index missing storage and panic.

The JavaScript binding must do more than Rust's `NodeId == NodeId`: it must know which tree issued a public NodeId and whether the node still exists before calling Taffy.

### JavaScript boundary

The outer model remains tree-centered:

```ts
const tree = new TaffyTree();
const child = tree.newLeaf(childStyle);
const root = tree.newWithChildren(rootStyle, [child]);

tree.computeLayout({ root, availableSpace });
const layout = tree.layout(child);
```

The public `TaffyTree` wrapper stores one private native tree in `#inner`, which remains the sole layout-state owner. `child` and `root` are bigint values that JavaScript can retain and pass back to tree methods; they do not own a second Style, Layout, or child list.

The public type is a bigint with a private phantom type marker and a private numeric encoding:

```ts
declare const phantomMarker: unique symbol;

export type NodeId = bigint & {
  readonly [phantomMarker]: never;
};
```

The private `unique symbol` is a phantom marker: it keeps an ordinary bigint from satisfying `NodeId` accidentally during type checking but has no runtime representation. It does not stop JavaScript from constructing or modifying a bigint, so runtime checks remain mandatory.

The bigint logically contains a tree identity, a binding-issued serial for that node creation, and the raw Taffy NodeId. The exact field widths and encoding are not public. Each public tree wrapper keeps a private registry such as:

```ts
#inner: NativeTaffyTree;
#nodes: PrivateNodeRegistry;
```

This registry contains one entry for each node currently stored in the TaffyTree. It is binding identity metadata, not a copy of Style, Layout, parent, children, or cache state.

Before native access, the wrapper confirms that each NodeId is a bigint with the complete private format, was issued by the target tree, and still matches the current registry entry for its raw Taffy NodeId. An ordinary object, a malformed bigint, a NodeId from another tree, and a NodeId for a removed node produce controlled JavaScript errors through @taffyjs/node.

The JavaScript registry is the sole NodeId-validity registry for the supported API, so the final current-node lookup must happen after the wrapper has normalized the operation's other caller-supplied inputs and immediately before a synchronous native call with those normalized values. This is an internal implementation constraint rather than additional public NodeId behavior. Direct calls to the separately published @taffyjs/binding-<platform> packages bypass the wrapper and are deliberately outside the public API and its safety guarantee.

A successful creation adds the corresponding registry entry, a successful removal deletes it, and clearing the tree clears the registry. A supported operation must not report success while exposing disagreement between the native tree and that registry. If a later node receives the same raw Taffy NodeId, it receives a new binding-issued serial and therefore a different public NodeId. The old bigint remains an ordinary JavaScript value but no longer passes the registry check.

The registry does not need weak keys or automatic cleanup when application code drops a NodeId. TaffyTree itself continues to own that node until explicit removal, clearing, or collection of the whole tree. The registry therefore grows with the nodes still stored in the tree, not with the number of nodes ever created. A bigint NodeId does not retain a reference to its tree, so collecting the tree also collects its registry.

### Equality in JavaScript

Every query that returns the same current node recreates the same bigint value. JavaScript can therefore use `===`, `Map`, `Set`, and `includes` directly. Equality states that two values name the same binding-issued node identity; it does not prove that the node is still present. Liveness is checked when a tree operation consumes the NodeId, so no separate `isSameNode` API is needed for ordinary identity comparisons.

### Conclusion

[VOUCHED @hyfdev 2026-08-10]

This case is closed as an API mapping exercise. It fixes the outer state owner, stored-layout behavior, owned snapshot boundary, public NodeId value model, JavaScript equality behavior, cross-tree and stale-node rejection, registry lifetime, internal-ID reuse behavior, and the initial no-data-cache boundary. The private NodeId bit layout, exact validation helpers, integration fixtures, optional dirty query, and optional runtime freezing remain implementation or additive API work and do not reopen this mapping unless new evidence contradicts one of its guarantees. The reusable rules distilled from this case are recorded in [Taffy-to-Node binding mapping](binding-mapping.md#lessons-from-the-first-mapping-case).

### Evidence

- [TaffyTree and NodeData implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [NodeId implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/node.rs)
- [Layout implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/layout.rs)
- [ECMAScript Map objects](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects)
- [ECMAScript SameValueZero comparison](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero)

## Case 2: Measurement context and callback re-entry

### Rust behavior

`TaffyTree<NodeContext>` chooses one concrete `NodeContext` type for the whole tree at compile time. A node created through `new_leaf_with_context` stores one value of that type. `compute_layout_with_measure` receives one synchronous closure for the compute call rather than storing a closure on each node. When Taffy needs an intrinsic size for a leaf, it calls that closure with known dimensions, available space, the current NodeId, an optional mutable reference to the node's context, and a shared reference to its Style. The closure returns a concrete size immediately.

The official example uses a Rust enum whose variants contain text or image data. One compute-time closure dispatches on that context and may also borrow external state such as a font registry. Taffy may skip measurement because of known dimensions or a cache hit and may measure a node more than once under different constraints, so the callback is not a one-time node lifecycle hook.

`compute_layout_with_measure` holds an exclusive mutable borrow of the TaffyTree while Taffy invokes the closure. The closure receives the information required for normal measurement but no tree reference. Safe Rust therefore does not permit the closure to capture and access that same tree, while an unrelated TaffyTree remains independent.

The selected JavaScript signature preserves this method directly as `computeLayoutWithMeasure({ root, availableSpace, measure })`. Its synchronous `measure` function receives one owned readonly object with `knownDimensions`, `availableSpace`, `node`, `context`, and `style`, then returns an owned width-and-height size. The separate direct `computeLayout({ root, availableSpace })` method preserves Taffy's no-measure variant. Both return `void` on success and throw controlled JavaScript errors on failure.

### Yoga comparison

Yoga attaches a JavaScript measure function to each node. The published `yoga-layout` 3.2.1 wrapper forwards `setMeasureFunc` and `calculateLayout` without a JavaScript layout-in-progress check, and Yoga's C++ calculate path invokes the node callback without an equivalent re-entry guard. Current Yoga main stores JavaScript measure functions in a module-side map keyed by the native node pointer and likewise invokes them synchronously without a busy check.

Two local experiments against the official `yoga-layout` 3.2.1 package confirmed the observable consequence. A measure function that invoked `root.calculateLayout` once recursively completed successfully and caused two measure calls. A separate measure function changed its node width to 37 while returning a measured width of 10; after layout, the Style width was 37, the stored Layout width was 10, and `isDirty()` was false. A second unchanged `calculateLayout` reused that result without another measure call. Yoga therefore does not provide a safety or cache-consistency precedent for same-tree mutation during measurement; its C++ ownership model also does not answer Rust's overlapping-reference requirement.

### Fixed Rust context

The binding cannot choose a different Rust `NodeContext` generic argument for each JavaScript value, and the actual JavaScript value must remain unknown to Rust. The native tree therefore uses `TaffyTree<()>` and preserves Taffy's optional-context behavior with a unit value:

A node with JavaScript context uses `new_leaf_with_context(style, ())` or `set_node_context(node, Some(()))`; a node without context uses `new_leaf` or `set_node_context(node, None)`. The unit value is a zero-sized presence marker, so Taffy retains its optional context and automatic dirtying behavior without any custom Rust context type. The measure bridge uses the raw NodeId that Taffy already supplies to reconstruct the public NodeId, and the scoped JavaScript dispatcher looks up the actual value in the wrapper-owned context registry.

JavaScript `undefined` always maps to the no-context path: no registry entry and `None` in Taffy. A context read or measure input returns `undefined` for that absence. The binding does not preserve a separate present-but-undefined state; `null`, a symbol, or an explicit object can represent an application-defined extra state without adding a presence flag to every callback.

Taffy still invokes its measure closure for every leaf that needs uncached intrinsic measurement, so the unit representation by itself does not remove Node-API callback crossings. Skipping the JavaScript callback when no context exists would be a separate API semantic choice because Taffy's direct callback may measure from NodeId, Style, or captured external data even when NodeContext is absent. A binding-local context ID is unnecessary because the existing NodeId registry already provides lookup identity; adding another identifier would create state that must remain synchronized without avoiding a lookup or a callback crossing.

### Re-entry policy and implementation

A measure callback is a synchronous calculation boundary rather than another tree-operation phase. Its public type exposes only owned inputs that are valid during measurement, and its documentation states that native operations on the same tree are unavailable until it returns. JavaScript can still capture the public wrapper, so these API cues do not replace runtime enforcement.

The private native class owns one checked state containing `RefCell<TaffyTree<()>>` and every future native field whose mutation or observation must be excluded during layout, exposes shared `&self` receivers, and calls `try_borrow` or `try_borrow_mut` once per operation. The borrow state is the single authority: normal calls perform one native borrow check, a same-tree callback entry receives an `Error` with code `ERR_TAFFY_TREE_BUSY`, and a different tree remains usable because it has independent state. No duplicate JavaScript busy flag is required. An operation that also changes a JavaScript registry must not report success with the wrapper and native tree inconsistent; its exact update order and failure recovery remain implementation work.

The error message names the attempted operation and explains that the same tree is running a measure callback. The code, rather than the exact message, is the compatibility surface. Callback error propagation remains a separate design problem because Taffy's measure closure returns a Size rather than a Result.

### Evidence

- [Taffy 0.13 measure example](https://github.com/DioxusLabs/taffy/blob/v0.13.0/examples/measure.rs)
- [TaffyTree measurement implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs#L909-L930)
- [Taffy leaf measurement implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/compute/leaf.rs)
- [Yoga 3.2.1 JavaScript wrapper](https://github.com/facebook/yoga/blob/v3.2.1/javascript/src/wrapAssembly.ts#L266-L329)
- [Yoga measurement implementation](https://github.com/facebook/yoga/blob/v3.2.1/yoga/algorithm/CalculateLayout.cpp#L302-L348)
- [Current Yoga JavaScript measure bridge](https://github.com/facebook/yoga/blob/main/javascript/src/wasm_bridge.c#L80-L135)
- [Node.js error-code convention](https://nodejs.org/api/errors.html#errorcode)
