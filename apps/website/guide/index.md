# Introduction

## What is a Layout Engine

A layout engine calculates where things go. It takes a tree of nodes, the layout rules attached to them, and the space available to the root. It returns a rectangle for each node: its position and size.

Browsers run layout as part of a much larger system that also parses HTML and CSS, paints pixels, and handles interaction. Many JavaScript programs already own those pieces. A canvas renderer, document generator, game UI, or server-side renderer may only need the layout calculation.

TaffyJS provides that calculation directly. It supports Block, Flexbox, and Grid, but it does not create DOM elements, parse CSS text, or render the result.

## Why TaffyJS

TaffyJS brings [Taffy](https://github.com/DioxusLabs/taffy), a mature layout engine written in Rust, to JavaScript. Rather than reimplementing its algorithms in JavaScript, TaffyJS exposes the same explicit model: create a tree, compute its layout, then read the result for each node.

- **A proven layout engine:** Taffy implements Block, Flexbox, and Grid and is used by projects including Servo, Bevy, Slint, and Zed.
- **Native performance:** `@taffyjs/node` runs the Rust engine through a native Node-API binding instead of requiring a WebAssembly runtime.
- **A JavaScript-facing API:** Inputs and results use typed, readable JavaScript values while the binding handles the lower-level conversion to Rust.
- **A direct API across runtimes:** `@taffyjs/wasm` exposes the same high-level tree and layout API in Node.js and bundled browsers.

If your content is already HTML and CSS in a browser, the browser's layout engine is usually the more direct choice. TaffyJS is for software that needs layout as data.

## TaffyJS's Feature Scope

TaffyJS is responsible for layout computation. It owns a node tree, accepts styles and available space, supports custom measurement for content, and stores the computed positions and sizes. Parsing, rendering, and interaction remain the responsibility of the program using it.

The package family separates different runtime and compatibility needs:

### `@taffyjs/node`

The native package for Node.js. It calls Taffy through Node-API and is the default package used throughout this guide. Choose it when your program runs on a supported Node.js platform and can use a native binary.

### `@taffyjs/wasm`

The WebAssembly package for Node.js and bundled browsers. It provides the same high-level API as `@taffyjs/node`, so the tree, styles, and layout code stay the same when the binding changes.

### `@taffyjs/yoga`

A Yoga 3.2.1 compatibility facade built on `@taffyjs/node`. It is for projects that already use Yoga's node and style model or need a migration path that keeps supported Yoga imports and calls intact.

### `@taffyjs/yoga-wasm`

The same Yoga compatibility facade built on `@taffyjs/wasm`. It keeps the Yoga-facing source and compatibility rules shared with `@taffyjs/yoga` while making WebAssembly an explicit runtime choice.

This guide uses `@taffyjs/node` by default. The same direct API also applies to `@taffyjs/wasm`. The two Yoga packages preserve Yoga's separate consumer-facing model over the corresponding native and WebAssembly runtimes.

## Credits

TaffyJS would not exist without [Taffy](https://github.com/DioxusLabs/taffy), which provides the layout engine and its Block, Flexbox, and Grid implementations. The native binding is built with [napi-rs](https://napi.rs/). We are grateful to the maintainers and contributors of both projects.
