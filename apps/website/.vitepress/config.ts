import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "TaffyJS",
  description: "High-performance layout for JavaScript, powered by Taffy and Rust.",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      {
        text: "@taffyjs/node",
        link: "https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Tree, Compute, and Read", link: "/guide/tree-compute-read" },
          { text: "Styles and Values", link: "/guide/styles-and-values" },
          { text: "Block Layout", link: "/guide/block" },
          { text: "Flexbox", link: "/guide/flexbox" },
          { text: "Grid", link: "/guide/grid" },
          { text: "Measuring Content", link: "/guide/measuring-content" },
          { text: "Complete Examples", link: "/guide/examples" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/hyfdev/taffyjs" }],
    externalLinkIcon: true,
  },
});
