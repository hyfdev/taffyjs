# Intent

TaffyJS is intended to bring Taffy, a high-performance layout engine written in Rust, to JavaScript through maintained packages that are straightforward to install and adopt without hiding Taffy's high-level model or adding avoidable language-boundary overhead.

## Current direction

- `@taffyjs/node` is the first entry point and provides native Node-API bindings built with napi-rs.
- `@taffyjs/wasm` is the explicit WebAssembly entry point for Node.js and bundled browsers. It reuses the `@taffyjs/node` public API over a threadless napi-rs WASIP binding rather than acting as an automatic fallback; its vouched contract is in [@taffyjs/wasm package design](taffyjs-wasm-package.md).
- A future `@taffyjs/yoga` package may provide a Yoga-compatible JavaScript API built on top of `@taffyjs/node` rather than as a second native implementation.
- The package family should support real consumers such as terminal UI frameworks without forcing those consumers to own their own Taffy bindings.

## @taffyjs/node binding role

`@taffyjs/node` exposes Taffy's high-level `TaffyTree` workflow without exposing low-level extension machinery or reimplementing layout in JavaScript. Taffy owns topology, Style, Layout, cache, and computation state; JavaScript adds only the public wrapper data needed for safe Node.js use.

The direct API remains available if measured performance helpers or convenience APIs are added later. Product-specific and compatibility APIs belong in packages above it.

The binding role and API priority are recorded in [@taffyjs/node decisions](taffyjs-node-decisions.md).

## Open questions

- Runtime and platform support beyond the current native targets and the approved `@taffyjs/wasm` Node.js and bundled-browser scope require a concrete consumer need.
- The coverage and release timing of `@taffyjs/yoga` remain open. Yoga compatibility is not part of the `@taffyjs/node` contract.
