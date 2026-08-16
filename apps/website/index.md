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
  - title: Powered by Rust
    details: TaffyJS uses Taffy, a mature, high-performance Rust engine for Block, Flexbox, and Grid layout.
  - title: Native performance
    details: The Node.js package runs natively and avoids unnecessary work when passing data between JavaScript and Rust.
  - title: Available everywhere
    details: Use @taffyjs/wasm in browsers and other runtimes, with the same API as @taffyjs/node.
---

<script setup>
import HomeLayoutShowcase from "./.vitepress/components/HomeLayoutShowcase.vue";
</script>

<HomeLayoutShowcase>

<<< ./examples/home-layout.js

</HomeLayoutShowcase>
