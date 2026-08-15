# Public Website

The public TaffyJS site is one VitePress application at `apps/website`. It represents the package family rather than one package and may contain the landing page, documentation, examples, and later blog or showcase material when real content exists.

## Product position

The landing page should foreground performance and the engine's maturity rather than present TaffyJS as a generic wrapper. TaffyJS brings a mature, high-performance layout engine written in Rust to JavaScript through bindings designed to preserve that performance.

Taffy upstream describes the engine as high-performance and lists use by projects including Servo, Bevy, Slint and Zed, which supports the engine-level position. This evidence does not by itself prove the performance of a JavaScript binding. Before the website publishes numerical or comparative TaffyJS performance claims, retained end-to-end measurements must include the JavaScript-to-Rust boundary and JavaScript input and output conversion costs. See the [Taffy repository](https://github.com/DioxusLabs/taffy) and [API alignment TODOs](api-alignment-todos.md).

The landing page speaks for TaffyJS as a family and presents the intended complete product rather than serving as a release-status page. It may describe the native and WebAssembly packages without labeling unfinished packages as planned; Guide and package documentation own concrete setup, runtime support, and public behavior.

The home page is only a landing page and uses VitePress's default theme. It contains a concise performance-led introduction, short summaries of the Rust/Taffy foundation, native Node.js performance and portable WebAssembly support, and direct routes to real package documentation and source. Tutorials, complete examples, runtime details and API reference belong to Guide or package documentation rather than the home page. The home page does not use invented testimonials, unsupported benchmark numbers or generic feature text to fill space.

## Package family

- `@taffyjs/node` is the first direct binding and the default package used by current Guide examples.
- `@taffyjs/wasm` is a planned alternate binding for the same high-level direct JavaScript API. Its package documentation owns WebAssembly loading, initialization, runtime support and binding-specific performance or deployment differences; it must not duplicate or fork the shared API reference merely because the transport differs.
- `@taffyjs/yoga` is a planned Yoga-compatible API built on `@taffyjs/node`. It has a distinct consumer model and therefore owns its own compatibility, migration and API documentation.

No planned package receives empty reference pages or documentation navigation that makes it look installable. The landing page may present the intended package family without progress labels, but a package receives a visible documentation section only when there is enough implementation and installation evidence to make that section useful.

## Documentation structure

Guide and each documented package have separate sidebars. Guide teaches in learning order, while a package section groups exact public behavior by the API a reader needs to find. The top navigation links directly to Guide and `@taffyjs/node` while it is the only documented package; it can become a package menu when another package has useful documentation. Empty package sections are not reserved in advance.

Guide uses `@taffyjs/node` by default while it is the first usable package. At points where runtime choice matters, a short callout sends browser or WebAssembly users to `@taffyjs/wasm` and users seeking Yoga compatibility to `@taffyjs/yoga`. The Guide does not repeat itself once per package.

Getting Started owns the shortest installation path, first complete computation, and observable result. The `@taffyjs/node` overview owns supported Node.js and platform combinations, native import rules, and package scope. The rest of that section is the canonical human-written reference for the direct `TaffyTree`, `Style`, layout result, value helper, and error APIs. The `@taffyjs/wasm` section documents only availability, setup and observable runtime differences, then links to the same direct API reference. The `@taffyjs/yoga` section documents its separate Yoga-compatible surface and differences from the direct API.

The target page groups are:

- Guide: introduction and getting started; the tree-compute-read workflow and styles and values as core concepts; Block, Flexbox, and Grid layout; and measuring content.
- `@taffyjs/node`: package overview and supported targets; `TaffyTree` node and topology operations, styles and context, computation and dirty state, and layout results; the grouped `Style` data model; value helpers; and errors.
- `@taffyjs/wasm`: package overview and setup, supported environments, initialization and deployment, observable differences from Node, and a link to the shared direct API reference.
- `@taffyjs/yoga`: package overview and installation, compatibility scope, migration from Yoga, Yoga-facing API reference, and documented differences from the direct Taffy API.

The global site navigation and the documentation sidebar serve different purposes. The landing page and later real Blog or Showcase sections are site-level content; Guide and package sections are documentation. Do not create empty Blog, Showcase, version switcher or package pages merely to make the site appear complete.

## Content ownership

- The landing page states the product value, intended package family, supported layout modes and the next useful destination.
- Guide explains how to complete layout tasks and how the shared model behaves.
- Package sections explain runtime support, package-specific differences and each package's public API.
- Getting Started and each relevant layout or measurement page own one complete example. There is no separate example collection that repeats those programs, and package pages and README files link to the Guide rather than copying them.
- Package README files remain short installation and orientation pages that link to the website.
- Source declarations and JSDoc remain the exhaustive editor-facing type and field reference. The website explains high-level APIs in human-written prose; its `Style` page groups related fields without reproducing a generated declaration dump or creating one page per field.
- Internal rationale and unsettled implementation details remain in Project Context Records rather than leaking into user documentation.
