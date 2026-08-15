# Tree, Compute, and Read

A `TaffyTree` owns a set of nodes and the relationships between them. A `NodeId` identifies one live node in that one tree. It is not a portable ID: moving it to another tree, retaining it after removal, or constructing your own bigint does not name a usable node.

## Build the topology

Leaf and parent creation are separate because nodes often exist before their final parent is known:

```ts
const first = tree.newLeaf(firstStyle);
const second = tree.newLeaf(secondStyle);
const root = tree.newWithChildren(rootStyle, [first, second]);
```

Topology methods operate on existing nodes. `addChild` appends a child, `insertChildAtIndex` inserts one at a position, and `setChildren` replaces the complete ordered child list. Removing a child from a parent detaches it; it does not delete the child. `remove(node)` deletes the node itself and makes its `NodeId` stale.

The package reference lists every topology operation and its exact failure cases. The important Guide-level rule is ownership: keep related IDs with their `TaffyTree`, and treat them as opaque values.

## Compute explicitly

Creating or changing nodes updates the tree's state but does not run layout. A compute call names both the root and the constraint for that run:

```ts
tree.computeLayout({
  root,
  availableSpace: {
    width: 640,
    height: AvailableSpace.MaxContent,
  },
});
```

The number `640` gives Taffy a definite 640-unit constraint. `AvailableSpace.Definite(640)` is the equivalent complete form. `MinContent` and `MaxContent` request intrinsic sizing behavior instead. Width and height are chosen independently.

## A dirty node can still have a stored layout

After a successful compute, Taffy can reuse cached work. Style and topology changes mark affected cache state dirty. `isDirty(node)` exposes that state; it does not compare a returned layout with every JavaScript value your program may have changed.

Consider a child whose layout has already been computed:

```ts
const previous = tree.getUnroundedLayout(child);

tree.setStyle(child, {
  size: { width: 80, height: 12 },
});

tree.isDirty(child); // true
tree.getUnroundedLayout(child).size; // still previous.size

tree.computeLayout({ root, availableSpace });
tree.getUnroundedLayout(child).size; // { width: 80, height: 12 }
```

The getter between the mutation and the compute returns the last stored result. It does not silently recompute a dirty node. This lets a program decide when layout work belongs in its own update cycle.

Call `markDirty(node)` when an input outside the tree changes, such as an object captured by a measurement callback. Dirtying retains the old stored layout until the next successful compute.

## Reads are snapshots

`getLayout`, `getUnroundedLayout`, `getStyle`, `getChildren`, and detailed Grid reads return detached snapshots. TypeScript marks output fields and arrays readonly to prevent accidental assumptions, but the JavaScript objects are not frozen. Mutating a snapshot only mutates that snapshot.

Use `getLayout` when you want the result selected by the tree's current rounding mode. Use `getUnroundedLayout` when fractional values matter. [Styles and Values](./styles-and-values.md) explains the input and output objects, and [Measuring Content](./measuring-content.md) explains the extra cache rules around callbacks.
