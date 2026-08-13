# @taffyjs/node API Alignment TODOs

The direct Taffy 0.13 binding is implemented. Current behavior belongs in the public API, declarations, tests, [binding mapping](binding-mapping.md), and [Node decisions](taffyjs-node-decisions.md); completed implementation prompts are not kept here as unchecked work. This file contains only work that remains open.

## Input transport performance

- [ ] Measure end-to-end JavaScript-to-native conversion in real Style-heavy workloads before changing the direct transport.
- [ ] If measurements justify another private path, compare positional primitive arguments for small fixed inputs with a reusable compact `Buffer` for large inputs such as `StyleInput`. Include JavaScript validation and buffer-writing time, preserve the public object API and errors, and keep the private format unobservable.

## Optional additions

- [ ] Decide whether construction capacity and `print_tree` have a normal JavaScript use case before adding them.
- [ ] Evaluate batch creation, topology mutation, layout reads, or reusable converted styles only against a measured workload; keep the direct methods available.
- [ ] Add JavaScript caches only with complete invalidation rules and evidence that copying Taffy-owned snapshots is a real bottleneck.
- [ ] Treat retained callbacks, off-thread layout, asynchronous measurement, cancellation, and result delivery as separate APIs with their own ownership and failure rules.

## Dependency and environment changes

- [ ] Re-audit the mapped high-level API, enabled features, known panic guards, and generated numeric families when the pinned Taffy version or feature set changes.
- [ ] Revisit callback failure transport if Taffy gains a fallible measurement function.
- [ ] Define and test Node worker and environment-lifetime behavior before allowing any native or retained JavaScript value to cross its current environment.
- [ ] Decide whether disabling Taffy's internal `calc` feature is useful; calc remains outside the public Style input either way.
- [ ] Establish retained performance measurements and regression limits only when an optimization is selected for implementation.
