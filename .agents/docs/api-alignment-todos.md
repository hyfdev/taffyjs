# @taffyjs/node API Alignment TODOs

The direct Taffy binding is implemented. This file contains open work that needs product evidence or a dependency change.

## Optional APIs and dependency changes

- [ ] Add construction capacity, `print_tree`, asynchronous or off-thread layout, cancellation, or worker transfer only for a concrete consumer need with explicit ownership and failure behavior.
- [ ] Re-audit the high-level API, enabled features, numeric values, known panic guards, conversion behavior, and callback failure handling when Taffy or napi-rs changes.
- [ ] Decide whether disabling Taffy's internal `calc` feature is useful; calc remains outside the public Style input either way.
