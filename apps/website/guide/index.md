# Introduction

TaffyJS calculates layout for a tree of nodes. You supply the tree, styles, and available space; TaffyJS returns the position and size of each node. Rendering remains your responsibility.

The layout work is performed by [Taffy](https://github.com/DioxusLabs/taffy), a Rust engine that implements Block, Flexbox, and Grid. `@taffyjs/node` exposes that engine as an explicit in-memory JavaScript API. It does not create DOM elements, parse CSS text, or draw anything.

This separation is useful when your program already owns its content and needs layout numbers for another system. Examples include a custom renderer, generated images or documents, and server-side work that should not depend on a browser. If you already have HTML and CSS in a browser, the browser's layout engine is usually the more direct choice.

## The working model

A TaffyJS program follows one visible sequence:

1. Create nodes in a `TaffyTree`.
2. Connect those nodes into a tree.
3. Compute layout for a root with a chosen amount of available space.
4. Read stored layout snapshots from the nodes you need.

Changing a style, context, or part of the topology does not run layout automatically. You decide when to recompute, which makes the work easy to place in a renderer or update loop.

Styles use JavaScript objects and named helpers such as `Display.Flex` and `Dimension.Length(100)`. Results use ordinary objects containing numbers. The public API stays close to Taffy's tree model rather than pretending to be a browser or a CSS parser.

Start with [Getting Started](./getting-started.md) to run the shortest complete example. The later Guide pages explain the state changes behind that example and introduce Block, Flexbox, Grid, and measured content without turning into a general CSS tutorial.
