# Public Website

The public TaffyJS site is one VitePress application at `apps/website`. It represents the package family rather than one package and may contain the landing page, documentation, examples, and later blog or showcase material when real content exists.

## Product position

The landing page should foreground performance and the engine's maturity rather than present TaffyJS as a generic wrapper. TaffyJS brings a mature, high-performance layout engine written in Rust to JavaScript through bindings designed to preserve that performance.

Taffy upstream describes the engine as high-performance and lists use by projects including Servo, Bevy, Slint and Zed, which supports the engine-level position. This evidence does not by itself prove the performance of a JavaScript binding. Before the website publishes numerical or comparative TaffyJS performance claims, retained end-to-end measurements must include the JavaScript-to-Rust boundary and JavaScript input and output conversion costs. See the [Taffy repository](https://github.com/DioxusLabs/taffy) and [API alignment TODOs](api-alignment-todos.md).

The landing page speaks for TaffyJS as a family and presents the intended complete product rather than serving as a release-status page. It may describe the native and WebAssembly packages without labeling unfinished packages as planned; package documentation owns current installation and availability details.

The home page is only a landing page and uses VitePress's default theme. It contains a concise performance-led introduction, short summaries of the Rust/Taffy foundation, native Node.js performance and portable WebAssembly support, and direct routes to real package documentation and source. Tutorials, complete examples, runtime details and API reference belong to Guide or package documentation rather than the home page. The home page does not use invented testimonials, unsupported benchmark numbers or generic feature text to fill space.

## Package family

- `@taffyjs/node` is the first direct binding and the default package used by current Guide examples.
- `@taffyjs/wasm` is a planned alternate binding for the same high-level direct JavaScript API. Its package documentation owns WebAssembly loading, initialization, runtime support and binding-specific performance or deployment differences; it must not duplicate or fork the shared API reference merely because the transport differs.
- `@taffyjs/yoga` is a planned Yoga-compatible API built on `@taffyjs/node`. It has a distinct consumer model and therefore owns its own compatibility, migration and API documentation.

No planned package receives empty reference pages or documentation navigation that makes it look installable. The landing page may present the intended package family without progress labels, but a package receives a visible documentation section only when there is enough implementation and installation evidence to make that section useful.

## Documentation structure

The target documentation sidebar is organized into four peer groups: Guide, `@taffyjs/node`, `@taffyjs/wasm`, and `@taffyjs/yoga`. Guide is independent of the package groups and teaches the shared layout model, styles and values, layout algorithms, measurement, and complete usage examples. A package group becomes visible only when that package has enough implementation and installation evidence to make its pages useful.

Guide uses `@taffyjs/node` by default while it is the first usable package. At points where runtime choice matters, a short callout sends browser or WebAssembly users to `@taffyjs/wasm` and users seeking Yoga compatibility to `@taffyjs/yoga`. The Guide does not repeat itself once per package.

The `@taffyjs/node` section owns installation, supported Node.js and platform combinations, native runtime behavior, and the canonical reference for the direct `TaffyTree` API. The `@taffyjs/wasm` section documents only availability, setup and observable runtime differences, then links to the same direct API reference. The `@taffyjs/yoga` section documents its separate Yoga-compatible surface and differences from the direct API.

The target page groups are:

- Guide: introduction, getting started, the tree-compute-read workflow, styles and values, Block/Flexbox/Grid usage, measuring content, and complete examples.
- `@taffyjs/node`: package overview and installation, supported targets, `TaffyTree` node and topology operations, styles and context, computation and dirty state, layout results, value helpers, and errors.
- `@taffyjs/wasm`: package overview and setup, supported environments, initialization and deployment, observable differences from Node, and a link to the shared direct API reference.
- `@taffyjs/yoga`: package overview and installation, compatibility scope, migration from Yoga, Yoga-facing API reference, and documented differences from the direct Taffy API.

The global site navigation and the documentation sidebar serve different purposes. The landing page and later real Blog or Showcase sections are site-level content; Guide and package sections are documentation. Do not create empty Blog, Showcase, version switcher or package pages merely to make the site appear complete.

## Content ownership

- The landing page states the product value, intended package family, supported layout modes and the next useful destination.
- Guide explains how to complete layout tasks and how the shared model behaves.
- Package sections explain installation, runtime differences and each package's public API.
- Complete examples have one maintained home and are linked rather than copied between Guide, package pages and README files.
- Package README files remain short installation and orientation pages that link to the website.
- Source declarations and JSDoc remain the exhaustive editor-facing type and field reference; the website explains high-level APIs in human-written prose rather than reproducing a generated symbol dump.
- Internal rationale and unsettled implementation details remain in Project Context Records rather than leaking into user documentation.
