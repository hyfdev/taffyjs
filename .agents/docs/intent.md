# Intent

TaffyJS is intended to make the Taffy layout engine available through maintained JavaScript packages that are straightforward for JavaScript projects to install and adopt.

## Current direction

- @taffyjs/node is the first entry point and provides native Node-API bindings built with napi-rs.
- The repository may later add @taffyjs/node-yoga as a Yoga-compatible JavaScript API built on top of @taffyjs/node rather than as a second native implementation.
- The package family should support real consumers such as terminal UI frameworks without forcing those consumers to own their own Taffy bindings.

## Deliberately open during bootstrap

- The binding surface, object model, and data-conversion strategy are not decided yet.
- Runtime support beyond Node.js and the native release target matrix are not decided yet.
- Yoga compatibility is a possible package, not part of the @taffyjs/node contract.
