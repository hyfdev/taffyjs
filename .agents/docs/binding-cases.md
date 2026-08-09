# Binding Mapping Cases

These cases start with observable Rust behavior and then derive the JavaScript boundary that can preserve it safely. They explain and test the mapping rules; vouched product judgments remain in [@taffyjs/node decisions](taffyjs-node-decisions.md).

The evidence baseline for this case is Taffy 0.13.0, napi 3.12.0, napi-derive 3.6.2, and @napi-rs/cli 3.8.2.

## Case 1: TaffyTree layout state and node handles

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

The JavaScript binding must do more than Rust's `NodeId == NodeId`: it must know which tree issued a handle and whether the node still exists before calling Taffy.

#### Node context cleanup is separate from handle validation

Taffy 0.13 removes node, child, and parent storage in `remove` and `clear`, but it does not remove the corresponding `node_context_data`. A context value can therefore remain alive until its slot is replaced or the whole tree is dropped. If the bridge context retains JavaScript functions or objects, the binding must release those resources explicitly. A live-node check alone does not perform that cleanup.

### JavaScript boundary

The outer model remains tree-centered:

```ts
const tree = new TaffyTree();
const child = tree.newLeaf(childStyle);
const root = tree.newWithChildren(rootStyle, [child]);

tree.computeLayout(root, availableSpace);
const layout = tree.layout(child);
```

`TaffyTree` is a native class and the sole layout-state owner. `child` and `root` are opaque values that JavaScript can retain and pass back to tree methods; they do not own a second Style, Layout, or child list.

The selected handle representation is Node-API External wrapping private Rust handle data. JavaScript cannot construct it, inspect its contents, add properties, or structured-clone it.

napi-rs stores a Rust `TypeId` inside `External<T>`, but that check is not enough for arbitrary JavaScript input. Its decoder must read the external data pointer before it can compare the `TypeId`, and that read is safe only when the pointer already refers to a napi-rs `External<T>`. Another native addon can create a Node-API External whose data has a different layout. The binding must therefore attach its own Node-API type tag when creating a node handle and verify that tag before asking napi-rs to decode the private Rust value, or use another mechanism that establishes the same fact without first reading the foreign pointer.

A TypeScript brand gives the opaque runtime value a public type without inventing a JavaScript field:

```ts
declare const nodeBrand: unique symbol;

export interface NodeHandle {
  readonly [nodeBrand]: never;
}
```

`declare` makes this a type declaration rather than runtime code. The private `unique symbol` name prevents an ordinary object from satisfying `NodeHandle` accidentally. It does not identify the issuing tree and cannot replace runtime validation.

Every tree operation that accepts a handle follows this order:

1. Confirm, without reading the external data pointer, that the value is an External created and tagged by this binding.
2. Decode the binding's private Rust handle data.
3. Confirm that the target TaffyTree issued the handle.
4. Confirm that the node still exists.
5. Only then pass the private NodeId to Taffy.

An ordinary object, an External from another native addon, a node handle from another tree, and a handle for a removed node produce controlled JavaScript errors. The exact internal records and public error classes remain open.

### Equality and JavaScript object identity

The same Taffy node may be represented by more than one JavaScript External value, so repeated queries are not required to satisfy `a === b`. Guaranteeing `===` would require the binding to retain and later clean up one canonical JavaScript reference for every live node.

An explicit comparison API may be added if consumers need node equality. Rust's raw NodeId equality is not sufficient for that API because equal numeric IDs can come from different trees. The placement of the comparison API and its behavior for foreign or removed handles remain open.

### Evidence

- [TaffyTree and NodeData implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [NodeId implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/node.rs)
- [Layout implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/layout.rs)
- [Node-API External values](https://nodejs.org/api/n-api.html#napi_create_external)
- [Node-API type tags](https://nodejs.org/api/n-api.html#napi_type_tag_object)
- [napi-rs External implementation](https://github.com/napi-rs/napi-rs/blob/napi-v3.12.0/crates/napi/src/bindgen_runtime/js_values/external.rs)
