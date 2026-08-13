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
