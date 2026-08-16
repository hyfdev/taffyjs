---
layout: home
title: High-performance layout for JavaScript
hero:
  name: TaffyJS
  text: A fast, Rust-based layout engine for JavaScript
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/hyfdev/taffyjs
features:
  - title: Native performance
    details: "@taffyjs/node runs Taffy as native Rust through Node-API. Tree operations update native state directly instead of maintaining a JavaScript copy."
  - title: WebAssembly support
    details: "@taffyjs/wasm runs the same JavaScript API in Node.js and bundled browsers when a native addon is not the right fit."
  - title: Yoga compatibility
    details: "Use @taffyjs/yoga or @taffyjs/yoga-wasm while preserving Yoga's API shape for a straightforward migration to TaffyJS."
---

<script setup>
import HomeLayoutShowcase from "./.vitepress/components/HomeLayoutShowcase.vue";
</script>

<HomeLayoutShowcase>

<<< ./examples/home-layout.js

</HomeLayoutShowcase>
