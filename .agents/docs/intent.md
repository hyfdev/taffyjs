# Intent

TaffyJS is intended to make the Taffy layout engine available through maintained JavaScript packages that are straightforward for JavaScript projects to install and adopt.

## Current direction

- @taffyjs/node is the first entry point and provides native Node-API bindings built with napi-rs.
- The repository may later add @taffyjs/node-yoga as a Yoga-compatible JavaScript API built on top of @taffyjs/node rather than as a second native implementation.
- The package family should support real consumers such as terminal UI frameworks without forcing those consumers to own their own Taffy bindings.

## @taffyjs/node binding role

@taffyjs/node is the low-level foundation that makes Taffy's Rust API available to Node.js, not a redesign of Taffy as a higher-level JavaScript layout SDK. Its baseline API should preserve Taffy's capabilities, concepts, and semantics as directly as Node.js permits so consumers can use Taffy without adopting an additional JavaScript-side abstraction.

The direct surface remains part of the package even when performance-oriented or more ergonomic APIs are added. Those additions should be optional and should not make the baseline path pay for a higher-level wrapper. Rawness is intentional at this layer; product-specific and compatibility-oriented designs belong outside the core binding.

Zero-cost abstraction here does not mean that crossing the Node-API boundary is free. It means that consumers of the direct surface do not incur the cost of optional JavaScript abstractions they did not choose. The exact representation, validation, ownership, conversion, copying, and call-boundary strategies remain implementation questions.

The binding role and API priority are vouched project direction in [@taffyjs/node decisions](taffyjs-node-decisions.md#direct-rust-aligned-binding-surface).

## Deliberately open during bootstrap

- The exact binding surface, object model, and data-conversion strategy are not decided beyond the direct-binding priority above.
- Runtime support beyond Node.js and the native release target matrix are not decided yet.
- Yoga compatibility is a possible package, not part of the @taffyjs/node contract.
