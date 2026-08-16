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
  - title: Direct Taffy binding
    details: "Taffy is a mature Rust engine for Block, Flexbox, and Grid. TaffyJS preserves its layout model instead of adding another abstraction."
  - title: Native performance
    details: "@taffyjs/node runs Taffy as native Rust through Node-API. Tree operations update native state directly instead of maintaining a JavaScript copy."
  - title: One API, two runtimes
    details: "Choose native @taffyjs/node for Node.js or @taffyjs/wasm for Node.js and bundled browsers. The JavaScript API stays the same."
---

<script setup>
import HomeLayoutShowcase from "./.vitepress/components/HomeLayoutShowcase.vue";
</script>

<HomeLayoutShowcase>

<<< ./examples/home-layout.js

</HomeLayoutShowcase>
