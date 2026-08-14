<script setup lang="ts">
const example = `import {
  AvailableSpace, Dimension, Display, TaffyTree,
} from "@taffyjs/node";

const tree = new TaffyTree();
const first = tree.newLeaf({ flexGrow: 1 });
const second = tree.newLeaf({ flexGrow: 1 });

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: {
      width: Dimension.Length(320),
      height: Dimension.Length(80),
    },
  },
  [first, second],
);

tree.computeLayout({
  root,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
});

tree.getLayout(second).location;
// { x: 160, y: 0 }`;
</script>

<template>
  <div class="hero-code" aria-label="Flexbox layout example using TaffyJS">
    <div class="hero-code__header">
      <span>flex-layout.ts</span>
      <span>@taffyjs/node</span>
    </div>
    <pre><code>{{ example }}</code></pre>
  </div>
</template>
