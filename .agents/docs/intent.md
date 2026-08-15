# Intent

TaffyJS is intended to make the Taffy layout engine available through maintained JavaScript packages that are straightforward for JavaScript projects to install and adopt.

## Current direction

- @taffyjs/node is the first entry point and provides native Node-API bindings built with napi-rs.
- The repository may later add @taffyjs/node-yoga as a Yoga-compatible JavaScript API built on top of @taffyjs/node rather than as a second native implementation.
- The package family should support real consumers such as terminal UI frameworks without forcing those consumers to own their own Taffy bindings.

## @taffyjs/node binding role

`@taffyjs/node` exposes Taffy's high-level `TaffyTree` workflow without exposing low-level extension machinery or reimplementing layout in JavaScript. Taffy owns topology, Style, Layout, cache, and computation state; JavaScript adds only the public wrapper data needed for safe Node.js use.

The direct API remains available if measured performance helpers or convenience APIs are added later. Product-specific and compatibility APIs belong in packages above it.

The binding role and API priority are recorded in [@taffyjs/node decisions](taffyjs-node-decisions.md).

## Open questions

- Runtime and platform support beyond Node.js 22.18, Linux x64 GNU, and Windows x64 MSVC require a concrete consumer need.
- Yoga compatibility is a possible package, not part of the @taffyjs/node contract.
