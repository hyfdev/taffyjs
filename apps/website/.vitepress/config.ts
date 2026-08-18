import { defineConfig } from "vitepress";

const documentationSidebar = [
  {
    text: "Guide",
    items: [
      { text: "Introduction", link: "/guide/" },
      { text: "Getting Started", link: "/guide/getting-started" },
    ],
  },
  {
    text: "Essentials",
    items: [
      { text: "Tree, Compute, and Read", link: "/guide/tree-compute-read" },
      { text: "Styles and Values", link: "/guide/styles-and-values" },
      { text: "Block", link: "/guide/block" },
      { text: "Flexbox", link: "/guide/flexbox" },
      { text: "Grid", link: "/guide/grid" },
      { text: "Measuring Text and Images", link: "/guide/measuring-content" },
    ],
  },
  {
    text: "@taffyjs/node",
    items: [
      { text: "Design Philosophy", link: "/node/design-philosophy" },
      { text: "Overview", link: "/node/" },
      { text: "Nodes and Topology", link: "/node/nodes-and-topology" },
      { text: "Styles and Context", link: "/node/styles-and-context" },
      {
        text: "setStyle vs updateStyle",
        link: "/node/set-style-vs-update-style",
      },
      { text: "Computing Layout", link: "/node/computing-layout" },
      { text: "Layout Results", link: "/node/layout-results" },
      { text: "Style", link: "/node/style" },
      { text: "Value Helpers", link: "/node/value-helpers" },
      { text: "Errors", link: "/node/errors" },
    ],
  },
  {
    text: "@taffyjs/wasm",
    items: [
      { text: "Design Philosophy", link: "/wasm/design-philosophy" },
      { text: "Overview", link: "/wasm/" },
    ],
  },
  {
    text: "@taffyjs/yoga",
    items: [
      { text: "Design Philosophy", link: "/yoga/design-philosophy" },
      { text: "Overview", link: "/yoga/" },
    ],
  },
  {
    text: "@taffyjs/yoga-wasm",
    items: [
      { text: "Design Philosophy", link: "/yoga-wasm/design-philosophy" },
      { text: "Overview", link: "/yoga-wasm/" },
    ],
  },
  {
    text: "Benchmarks",
    items: [{ text: "Performance", link: "/benchmarks/" }],
  },
];

export default defineConfig({
  base: "/taffyjs/",
  lang: "en-US",
  title: "TaffyJS",
  description: "High-performance layout for JavaScript, powered by Taffy and Rust.",
  themeConfig: {
    nav: [
      {
        text: "Guide",
        link: "/guide/getting-started",
        activeMatch: "^/(guide|node|wasm|yoga|yoga-wasm|benchmarks)/",
      },
    ],
    sidebar: {
      "/guide/": documentationSidebar,
      "/node/": documentationSidebar,
      "/wasm/": documentationSidebar,
      "/yoga/": documentationSidebar,
      "/yoga-wasm/": documentationSidebar,
      "/benchmarks/": documentationSidebar,
    },
    socialLinks: [{ icon: "github", link: "https://github.com/hyfdev/taffyjs" }],
    externalLinkIcon: true,
  },
});
