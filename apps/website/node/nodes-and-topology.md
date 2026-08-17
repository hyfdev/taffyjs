# Nodes and Topology

A `TaffyTree<TContext>` is an independent owner. Its `NodeId` values are opaque bigints that only name live nodes in that same tree.

## Create nodes

The constructor takes no arguments:

```ts
const tree = new TaffyTree<MyContext>();
```

Three methods create nodes:

```ts
const leaf = tree.newLeaf(style);
const contextualLeaf = tree.newLeafWithContext(style, context);
const parent = tree.newWithChildren(style, [leaf, contextualLeaf]);
```

`newLeaf(style)` creates a node without children or context. `newLeafWithContext(style, context)` also associates a JavaScript value; `undefined` means that no context is present. `newWithChildren(style, children)` creates a node and attaches the supplied live, currently unattached children in order.

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

In Taffy 0.13, removing the node itself does not mark its former parent or ancestors dirty. Call `markDirty(formerParent)` before the next compute when their layout must account for the removal. The child-detachment methods in the previous section do mark the affected parent path dirty.

`clear()` removes every node, context value, and per-node measure function. All IDs previously created by the tree become stale. The tree itself remains reusable, and its rounding mode is retained.

## `NodeId` lifetime

`NodeId` is a TypeScript-branded `bigint`. It works as a stable JavaScript identity while the node remains live, including as a `Map` or `Set` key. Its bit layout is not a public format, and arithmetic produces a plain bigint rather than another valid `NodeId`.

The binding distinguishes three mistakes:

- A bigint that was not issued as a node ID fails with `ERR_TAFFY_INVALID_NODE_ID`.
- An ID issued by another tree fails with `ERR_TAFFY_FOREIGN_NODE_ID`.
- An ID left behind by `remove` or `clear` fails with `ERR_TAFFY_STALE_NODE_ID`.

Native storage slots may be reused, but an old public ID never starts naming the replacement node. See [Errors](./errors.md) for the error classes and failure guarantees.
