# Public Website

The public TaffyJS site is one VitePress application at `apps/website`. It represents the package family rather than one package and may contain the landing page, documentation, examples, and later blog or showcase material when real content exists.

## Product position

The landing page should foreground performance and the engine's maturity rather than present TaffyJS as a generic wrapper. TaffyJS brings a mature, high-performance layout engine written in Rust to JavaScript through bindings designed to preserve that performance.

Taffy upstream describes the engine as high-performance and lists use by projects including Servo, Bevy, Slint and Zed, which supports the engine-level position. This evidence does not by itself prove the performance of a JavaScript binding. Before the website publishes numerical or comparative TaffyJS performance claims, retained end-to-end measurements must include the JavaScript-to-Rust boundary and JavaScript input and output conversion costs. See the [Taffy repository](https://github.com/DioxusLabs/taffy) and [API alignment TODOs](api-alignment-todos.md).

The landing page speaks for TaffyJS as a family and presents the intended complete product rather than serving as a release-status page. It may describe the native and WebAssembly packages without labeling unfinished packages as planned; Guide and package documentation own concrete setup, runtime support, and public behavior.

The home page is only a landing page and uses VitePress's default theme. It contains a concise performance-led introduction, short summaries of the Rust/Taffy foundation, native Node.js performance and portable WebAssembly support, and direct routes to real package documentation and source. Tutorials, complete examples, runtime details and API reference belong to Guide or package documentation rather than the home page. The home page does not use invented testimonials, unsupported benchmark numbers or generic feature text to fill space.

The landing page includes one code-to-layout example below the default Home content. It shows ordinary direct TaffyJS JavaScript rather than JSX or a second wrapper API, and the adjacent rectangles come from that exact source through `@taffyjs/wasm` and `getLayout`. Variable names label the corresponding boxes. Controls expose only inputs whose effects are immediately visible in those rectangles: available width, sidebar width, header height, and the horizontal and vertical gaps. The home page does not grow into an arbitrary code editor or a general-purpose playground.

## Package family

- `@taffyjs/node` is the first direct binding and the default package used by current Guide examples.
- `@taffyjs/wasm` is the explicit WebAssembly binding for the same high-level direct JavaScript API. Its package documentation owns WebAssembly loading, initialization, runtime support and binding-specific performance or deployment differences; it must not duplicate or fork the shared API reference merely because the transport differs.
- `@taffyjs/yoga` is a planned Yoga-compatible API built on `@taffyjs/node`. It has a distinct consumer model and therefore owns its own compatibility, migration and API documentation.

No planned package receives empty reference pages or documentation navigation that makes it look installable. The landing page may present the intended package family without progress labels, but a package receives a visible documentation section only when there is enough implementation and installation evidence to make that section useful. `@taffyjs/wasm` now meets that threshold; `@taffyjs/yoga` does not yet have a package section.

## Documentation structure

The documentation is arranged in three layers: Guide, Essentials, and package sections. Guide contains the Introduction and Getting Started. Essentials teaches the shared layout-engine model in learning order. Package sections hold complete runtime and platform support, initialization, binding-specific behavior, compatibility, migration, and exact public API details. The top navigation links to Guide and a package menu containing the implemented Node and Wasm packages. Empty package sections are not reserved in advance.

Getting Started and Essentials use `@taffyjs/node` code by default. At points where runtime choice matters, a short callout sends browser or WebAssembly users to `@taffyjs/wasm` and users seeking Yoga compatibility to `@taffyjs/yoga`. Shared teaching is not repeated once per package.

The Introduction first explains what a layout engine does, then why TaffyJS exists, then the package family's feature scope, and finally credits the upstream work it builds on. Its feature-scope section introduces each package by purpose and distinguishing characteristic without adding installation instructions or empty documentation for unfinished packages.

Getting Started owns the shortest installation command, the minimum Node.js version needed to run it, and one smallest complete `@taffyjs/node` example. It begins with the equivalent familiar HTML and CSS, keeps one Flexbox relationship stable while translating it into TaffyJS, and explicitly names where the browser analogy stops. Its job is to establish the basic layout-engine model: a tree of nodes, styles, available space, an explicit computation, and stored layout results. Changing only the available width must produce an observable second result so the reader can distinguish a node's relative style from the outside constraint. It does not branch into layout-mode tutorials, caching, error cases, or API reference details.

Getting Started keeps the runnable Node example as the canonical code path and uses `@taffyjs/wasm` for one in-page example that runs the same tree in the browser. The example shows its fixed, read-only source on the left and its available-space control and computed result on the right; the displayed source is the code being executed. The control varies available space while keeping the tree and styles fixed, revealing the same relationship without replacing or forking the Node example.

Essentials continues directly from that model. It explains what each shared concept is, the role it plays, how it affects a computation, and how to use it through focused `@taffyjs/node` examples. The sequence moves from the tree-compute-read lifecycle and styles and values into Block, Flexbox, Grid, and measuring text and images. The measurement page first establishes that Taffy only lays out boxes and relies on application-owned text and image systems for intrinsic sizes, then teaches the callback boundary. These pages teach the model rather than enumerate every method or field.

The `@taffyjs/node` overview owns supported Node.js and platform combinations, native import rules, and package scope. The rest of that section is the canonical human-written reference for the direct `TaffyTree`, `Style`, layout result, value helper, and error APIs shared by Node and Wasm. The `@taffyjs/wasm` section owns availability, setup and observable runtime differences and links back to that shared reference instead of duplicating it. The `@taffyjs/yoga` section will own its Yoga-compatible surface, migration guidance, compatibility scope, and behavioral differences from the direct API.

The target page groups are:

- Guide: Introduction and Getting Started only.
- Essentials: the tree-compute-read workflow, styles and values, Block, Flexbox, Grid, and measuring text and images.
- `@taffyjs/node`: package overview and supported targets; `TaffyTree` node and topology operations, styles and context, computation and dirty state, and layout results; the grouped `Style` data model; value helpers; and errors.
- `@taffyjs/wasm`: package overview and setup, supported environments, initialization and deployment, observable differences from Node, and a link to the shared direct API reference.
- `@taffyjs/yoga`: package overview and installation, compatibility scope, migration from Yoga, Yoga-facing API reference, and documented differences from the direct Taffy API.

The global site navigation and the documentation sidebar serve different purposes. The landing page and later real Blog or Showcase sections are site-level content; Guide and package sections are documentation. Do not create empty Blog, Showcase, version switcher or package pages merely to make the site appear complete.

## Content ownership

- The landing page states the product value, intended package family, supported layout modes and the next useful destination.
- Guide introduces the product and establishes the minimum layout-engine mental model.
- Essentials teaches shared concepts and layout tasks in a deliberate learning sequence through `@taffyjs/node` code.
- Package sections explain package-specific runtime requirements or initialization, observable binding behavior, compatibility or migration needs, and exact public APIs.
- Getting Started and each relevant layout or measurement page own one complete example. There is no separate example collection that repeats those programs, and package pages and README files link to the Guide rather than copying them.
- Package README files remain short installation and orientation pages that link to the website.
- Source declarations and JSDoc remain the exhaustive editor-facing type and field reference. The website explains high-level APIs in human-written prose; its `Style` page groups related fields without reproducing a generated declaration dump or creating one page per field.
- Internal rationale and unsettled implementation details remain in Project Context Records rather than leaking into user documentation.
