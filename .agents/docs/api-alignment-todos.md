# @taffyjs/node API Alignment TODOs

The direct Taffy 0.13 binding is implemented. This file contains open work that needs product evidence or a dependency change.

## Performance

- [ ] Use a real consumer workload and complete end-to-end measurements before changing data transfer. If a problem is shown, consider positional numbers for small fixed inputs, a compact private buffer for large inputs such as `StyleInput`, batch operations, selective reads, or another measured solution. Include JavaScript conversion cost and preserve the public API.

## Optional APIs and dependency changes

- [ ] Add construction capacity, `print_tree`, retained callbacks, asynchronous or off-thread layout, cancellation, or worker transfer only for a concrete consumer need with explicit ownership and failure behavior.
- [ ] Re-audit the high-level API, enabled features, numeric values, known panic guards, conversion behavior, and callback failure handling when Taffy or napi-rs changes.
- [ ] Decide whether disabling Taffy's internal `calc` feature is useful; calc remains outside the public Style input either way.
