# Nodes and Topology

A `TaffyTree<TContext>` is an independent owner. Its `NodeId` values are Taffy's raw `u64` keys represented as TypeScript-branded bigints and must only be used while live with the tree that returned them.

## Create nodes

The constructor takes no arguments:

```ts
const tree = new TaffyTree<MyContext>();
```

Three methods create nodes:

```ts
const leaf = tree.newLeaf();
const styledLeaf = tree.newLeaf(style);
const contextualLeaf = tree.newLeafWithContext(context, style);
const parent = tree.newWithChildren([leaf, contextualLeaf], style);
```

`newLeaf(style?)` creates a node without children or context. `newLeafWithContext(context, style?)` also associates a JavaScript value; `undefined` means that no context is present. `newWithChildren(children, style?)` creates a node and attaches the supplied live, currently unattached children in order. Omitting `style`, or passing it as `undefined`, uses Taffy's default style.

Creation converts the complete style and validates every child before adding the new node. If conversion or topology validation fails, no node is created.

## Inspect the tree

| Method                           | Result                                               |
| -------------------------------- | ---------------------------------------------------- |
| `getNodeCount()`                 | Number of live nodes owned by this tree.             |
| `getChildCount(parent)`          | Number of current children.                          |
| `getParent(node)`                | Parent `NodeId`, or `null` for a root.               |
| `getChildren(parent)`            | Detached readonly snapshot of the ordered child IDs. |
| `getChildAtIndex(parent, index)` | Child at one zero-based index.                       |

The child array is a snapshot. Reordering or extending it at runtime does not change the tree.

## Change parent-child relationships

Topology methods operate on existing nodes:

| Method                                         | Effect                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `addChild(parent, child)`                      | Append one unattached child.                                                                                 |
| `insertChildAtIndex(parent, index, child)`     | Insert one unattached child; `index === childCount` appends.                                                 |
| `setChildren(parent, children)`                | Replace the complete ordered list, detaching omitted children and reparenting supplied children when needed. |
| `removeChild(parent, child)`                   | Detach a specific child.                                                                                     |
| `removeChildAtIndex(parent, index)`            | Detach and return the child at an index.                                                                     |
| `removeChildrenRange(parent, { start, end })`  | Detach the half-open range from `start` through, but not including, `end`.                                   |
| `replaceChildAtIndex(parent, index, newChild)` | Replace and return one child.                                                                                |

Except for `setChildren`, attaching an already parented node is rejected. A replacement may be the child already present at that index, which is a no-op. Duplicate children, self-parenting, and cycles are invalid topology.

Indices and range endpoints must be non-negative integers within the relevant bounds. A detached child remains live, retains its style and context, and can be attached elsewhere.

## Remove nodes

`remove(node)` deletes one node, invalidates its `NodeId`, detaches it from its parent, and leaves its children alive as roots. It also releases the removed node's JavaScript context and per-node measure function.

Removing the node marks its former parent and ancestors dirty, like the child-detachment methods in the previous section, so the next compute accounts for the removal.

`clear()` removes every node, context value, and per-node measure function. All IDs previously created by the tree become stale and must not be used again. The tree itself remains reusable, and its rounding mode is retained.

## `NodeId` lifetime

`NodeId` is a TypeScript-branded `bigint` whose runtime value is exactly Taffy's raw NodeId. It works as a stable JavaScript identity while the node remains live, including as a `Map` or `Set` key. Treat the value as opaque and nonpersistent: arithmetic produces a plain bigint rather than a supported `NodeId`.

Identity is scoped to one tree:

- Independent trees may issue equal NodeId values, so equality across trees has no node-identity meaning.
- Passing another tree's value can operate on a numerically matching node in the receiving tree.
- Passing a forged or stale in-range value is unsupported and has no stable error classification.
- A value that is not a bigint in the `u64` range is rejected with `TypeError`.

SlotMap normally changes a key's generation when a removed storage slot is reused, so ordinary reuse produces a different NodeId without wrapper bookkeeping. TaffyJS adds no owner token, creation serial, or live-node registry and makes no stronger anti-revival guarantee. See [Errors](./errors.md) for the supported error boundary.
