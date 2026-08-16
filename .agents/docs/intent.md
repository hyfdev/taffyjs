# Intent

TaffyJS is intended to bring Taffy, a high-performance layout engine written in Rust, to JavaScript through maintained packages that are straightforward to install and adopt without hiding Taffy's high-level model or adding avoidable language-boundary overhead. [VOUCHED @hyfdev 2026-08-14]

## Current direction

- `@taffyjs/node` is the first entry point and provides native Node-API bindings built with napi-rs.
- `@taffyjs/wasm` is the explicit WebAssembly entry point for Node.js and bundled browsers. It reuses the `@taffyjs/node` public API over a threadless napi-rs WASIP binding rather than acting as an automatic fallback; its vouched contract is in [@taffyjs/wasm package design](taffyjs-wasm-package.md).
- `@taffyjs/yoga` is the Node-only Yoga 3.2.1 compatibility package built on top of `@taffyjs/node`; browser and WASM backends remain outside that package.
- The package family should support real consumers such as terminal UI frameworks without forcing those consumers to own their own Taffy bindings.

## Bun and Deno runtime support

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** The implemented `@taffyjs/node` and `@taffyjs/wasm` packages support Bun 1.2+ within the Bun 1 major and Deno 2.2+ within the Deno 2 major. Runtime support follows one current major at a time rather than spanning majors.

**Limits:** Adopting a new Bun or Deno major requires choosing and documenting a new mainstream minimum minor and ends the support promise for the previous major. This ruling does not treat unimplemented packages as supported. Deno use of `@taffyjs/node` requires local `node_modules` plus environment, read, and FFI permissions; `@taffyjs/wasm` requires no Deno permission flags.

**Verification:** CI runs one minimal public-package layout smoke at only the first release of each supported minor floor, Bun 1.2.0 and Deno 2.2.0. It does not copy the complete behavior suite, test a second endpoint, or retain a cross-major matrix.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; selected mainstream minimum minors within only the current runtime majors, chose Bun 1.2+ and Deno 2.2+ after both package paths passed at their `.0` releases, required only that minimum endpoint in CI, and asked to vouch the rule.

## @taffyjs/node binding role

`@taffyjs/node` exposes Taffy's high-level `TaffyTree` workflow without exposing low-level extension machinery or reimplementing layout in JavaScript. Taffy owns topology, Style, Layout, cache, and computation state; JavaScript adds only the public wrapper data needed for safe Node.js use.

The direct API remains available if measured performance helpers or convenience APIs are added later. Product-specific and compatibility APIs belong in packages above it.

The binding role and API priority are recorded in [@taffyjs/node decisions](taffyjs-node-decisions.md).

## Open questions

- Runtime and platform support beyond the current native targets, the approved `@taffyjs/wasm` Node.js and bundled-browser scope, Bun 1.2+ within major 1, and Deno 2.2+ within major 2 requires a concrete consumer need.
- The release timing of `@taffyjs/yoga` remains open. Yoga compatibility is not part of the `@taffyjs/node` contract.
