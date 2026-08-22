# Computing Layout

Layout computation is synchronous and explicit. Getters never trigger it, and mutations never schedule it.

## Standard computation

`computeLayout` takes one root and a complete available-space value:

```ts
tree.computeLayout({
  root,
  availableSpace: {
    width: 800,
    height: AvailableSpace.MaxContent,
  },
});
```

Each axis has one of three meanings:

- A number supplies a concrete constraint; `AvailableSpace.Definite(value)` is its complete form.
- `AvailableSpace.MinContent` requests minimum-content sizing.
- `AvailableSpace.MaxContent` requests maximum-content sizing.

`computeLayout` automatically invokes a measure function only for a leaf configured with `setMeasure`, unless the options also provide a global `measure` fallback. Without a fallback, every unconfigured leaf stays in Rust and uses ordinary Taffy leaf sizing. When the whole tree has no configured measure function and the call has no fallback, the wrapper keeps the direct native `computeLayout` fast path.

## Dirty state and caching

New nodes start dirty. A successful compute normally leaves the computed state clean. `isDirty(node)` reports Taffy's cache state, and `markDirty(node)` explicitly invalidates that node and the necessary ancestor path.

Style replacement, context replacement, topology changes, and every `setMeasure` call normally dirty the affected path. Setting the same per-node callback again still dirties the node because the call explicitly resets its measurement behavior. External mutations are not observable, so changing a context object or data captured by a callback requires an explicit `markDirty`.

The global fallback's identity and presence are not part of Taffy's cache key. Adding, removing, or changing the fallback or its captured data therefore requires marking every potentially affected leaf dirty before computing again. `markDirty(root)` is not enough: it clears that node and its ancestors, not cached descendants.

A dirty node can still have a previously stored layout. Reading it returns that old snapshot until another successful compute stores a new result.

## Rounding

The tree starts with pixel rounding enabled. `getLayout(node)` selects rounded output while rounding is enabled and unrounded output while it is disabled. `getUnroundedLayout(node)` always reads the unrounded result.

Use `enableRounding()` or `disableRounding()` to change the mode. Compute again after changing it before relying on `getLayout`; the methods do not themselves recompute the tree. The selected mode survives `clear()`.

## Per-node measurement

Register the ordinary measurement path on each node that owns externally measured content, then call `computeLayout`:

```ts
tree.setMeasure(label, measureText);

tree.computeLayout({
  root,
  availableSpace,
});
```

`setMeasure(node, measure)` sets or replaces the callback. `setMeasure(node, undefined)` clears it. Context and measurement are independent: a node may have either, both, or neither. Setting, replacing, or clearing a callback marks that node dirty. If data captured by an unchanged callback changes without another setter call, use `markDirty(node)`.

## How often the callback runs

Taffy decides which intrinsic sizes a layout needs, so one `computeLayout` call can ask a measured node for several different constraint combinations. Requests that repeat exactly within one call enter JavaScript once.

A flex item whose minimum main size stays at the CSS default of `auto` resolves that minimum by measuring the min-content size of its own subtree, and the measurement reaches every measured node below it. Every container between the root and a measured node pays it. Declaring `minSize: { width: 0, height: 0 }` on those containers removes the pass: in a modeled chat screen with 51 measured nodes, the callback runs 590 times with the default and 288 times with the explicit zero minimum, and both produce identical layout output.

An explicit zero minimum also removes what it buys. A flex item with an automatic minimum main size never shrinks below its own min-content size; one with a zero minimum can. Declare the zero minimum where the layout does not depend on that floor.

## Optional global fallback

Pass `measure` to `computeLayout` for compatibility and advanced cases where any otherwise unconfigured leaf may need external measurement:

```ts
tree.computeLayout({
  root,
  availableSpace,
  measure({ knownDimensions, availableSpace, node, context, getStyle }) {
    const style = needsStyle(context) ? getStyle() : undefined;
    return measureContent({ knownDimensions, availableSpace, node, context, style });
  },
});
```

Dispatch priority is the node's configured measure first, then the current call's global fallback, then ordinary native leaf sizing without entering JavaScript. Existing code that only supplies the global fallback keeps its previous behavior: Taffy may ask it to measure any leaf that needs an intrinsic size. Context is optional, and `setNodeContext` changes or clears the value without enabling or disabling measurement.

The callback is validated as a function before native computation, even when Taffy may satisfy the request from cache. Taffy controls whether it runs, how often it runs, and the order of calls.

`knownDimensions` contains a number for an axis already fixed by layout and `undefined` otherwise. Callback `availableSpace` uses the same three tagged forms described above. `node` is the public ID, and `context` is the exact JavaScript value stored for it. Call `getStyle()` only when measurement needs the node's style; each call returns a fresh, complete, normalized, detached `Style` snapshot. If the callback never calls it, taffyjs does not create a JavaScript `Style` object. The callback must return a complete `{ width, height }` record synchronously.

This is a breaking change from the earlier callback shape: destructure `getStyle` and call it where needed instead of destructuring an eager `style` value.

During the callback, native-backed methods on the same tree fail with `ERR_TAFFY_TREE_BUSY`. `getStyle()` is the callback-safe way to read the measured node's style; retained `getStyle` functions also remain safe to call after the callback returns. `getNodeContext`, public value helpers, callback arguments, and operations on another tree remain usable.

A thrown per-node or fallback callback value, or an invalid result, stops the computation. See [Errors](./errors.md#measurement-failures) for the exact rethrow behavior and the state that remains afterward.
