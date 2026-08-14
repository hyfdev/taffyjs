import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "TaffyJS",
  description: "High-performance layout for JavaScript, powered by Taffy and Rust.",
  themeConfig: {
    nav: [
      {
        text: "@taffyjs/node",
        link: "https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node",
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/hyfdev/taffyjs" }],
    externalLinkIcon: true,
  },
});
