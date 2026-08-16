<script setup>
import { computed, onMounted, ref, shallowRef } from "vue";

const availableWidth = ref(380);
const sidebarWidth = ref(88);
const headerHeight = ref(40);
const horizontalGap = ref(12);
const verticalGap = ref(12);
const layout = shallowRef(null);
const loadError = ref("");

let computeHomeLayout;

const visual = computed(() => {
  if (!layout.value) return null;

  const { root, sidebar, main, header, content } = layout.value;
  const mainX = main.location.x;
  const mainY = main.location.y;

  return {
    width: root.size.width,
    height: root.size.height,
    sidebar: {
      x: sidebar.location.x,
      y: sidebar.location.y,
      width: sidebar.size.width,
      height: sidebar.size.height,
    },
    main: {
      x: mainX,
      y: mainY,
      width: main.size.width,
      height: main.size.height,
    },
    header: {
      x: mainX + header.location.x,
      y: mainY + header.location.y,
      width: header.size.width,
      height: header.size.height,
    },
    content: {
      x: mainX + content.location.x,
      y: mainY + content.location.y,
      width: content.size.width,
      height: content.size.height,
    },
  };
});

function updateLayout() {
  if (!computeHomeLayout) return;
  layout.value = computeHomeLayout({
    availableWidth: availableWidth.value,
    sidebarWidth: sidebarWidth.value,
    headerHeight: headerHeight.value,
    horizontalGap: horizontalGap.value,
    verticalGap: verticalGap.value,
  });
}

onMounted(async () => {
  try {
    ({ computeHomeLayout } = await import("../../examples/home-layout.js"));
    updateLayout();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<template>
  <section class="home-layout-showcase" aria-labelledby="home-layout-heading">
    <div class="home-layout-copy">
      <h2 id="home-layout-heading">From code to layout</h2>
      <p>
        Build a tree, compute it, and read back rectangles. This example runs through
        <code>@taffyjs/wasm</code> in your browser; use <code>@taffyjs/node</code> with the same API
        in Node.js.
      </p>
    </div>

    <div class="home-layout-grid">
      <div class="home-layout-code" aria-label="TaffyJS example code">
        <slot />
      </div>

      <div class="home-layout-result">
        <div class="home-layout-controls">
          <div class="home-layout-control">
            <label for="home-layout-width">
              <code>availableWidth</code>
              <output>{{ availableWidth }}</output>
            </label>
            <input
              id="home-layout-width"
              v-model.number="availableWidth"
              type="range"
              min="300"
              max="520"
              step="20"
              :disabled="!visual"
              @input="updateLayout"
            />
          </div>

          <div class="home-layout-control">
            <label for="home-layout-sidebar-width">
              <code>sidebarWidth</code>
              <output>{{ sidebarWidth }}</output>
            </label>
            <input
              id="home-layout-sidebar-width"
              v-model.number="sidebarWidth"
              type="range"
              min="72"
              max="136"
              step="8"
              :disabled="!visual"
              @input="updateLayout"
            />
          </div>

          <div class="home-layout-control">
            <label for="home-layout-header-height">
              <code>headerHeight</code>
              <output>{{ headerHeight }}</output>
            </label>
            <input
              id="home-layout-header-height"
              v-model.number="headerHeight"
              type="range"
              min="32"
              max="72"
              step="4"
              :disabled="!visual"
              @input="updateLayout"
            />
          </div>

          <div class="home-layout-control">
            <label for="home-layout-horizontal-gap">
              <code>horizontalGap</code>
              <output>{{ horizontalGap }}</output>
            </label>
            <input
              id="home-layout-horizontal-gap"
              v-model.number="horizontalGap"
              type="range"
              min="0"
              max="32"
              step="4"
              :disabled="!visual"
              @input="updateLayout"
            />
          </div>

          <div class="home-layout-control">
            <label for="home-layout-vertical-gap">
              <code>verticalGap</code>
              <output>{{ verticalGap }}</output>
            </label>
            <input
              id="home-layout-vertical-gap"
              v-model.number="verticalGap"
              type="range"
              min="0"
              max="32"
              step="4"
              :disabled="!visual"
              @input="updateLayout"
            />
          </div>
        </div>

        <div v-if="visual" class="home-layout-canvas">
          <div class="home-layout-root-label">
            <span><code>root</code> = <code>sidebar</code> + <code>main</code></span>
            <span>{{ visual.width }} × {{ visual.height }}</span>
          </div>
          <svg
            :viewBox="`0 0 ${visual.width} ${visual.height}`"
            role="img"
            :aria-label="`Computed layout at ${visual.width} by ${visual.height}: a fixed-width sidebar beside a flexible main area containing a header and content.`"
          >
            <rect
              class="box root"
              x="1"
              y="1"
              :width="visual.width - 2"
              :height="visual.height - 2"
              rx="7"
            />
            <rect
              class="box sidebar"
              :x="visual.sidebar.x"
              :y="visual.sidebar.y"
              :width="visual.sidebar.width"
              :height="visual.sidebar.height"
              rx="6"
            />
            <rect
              class="box header"
              :x="visual.header.x"
              :y="visual.header.y"
              :width="visual.header.width"
              :height="visual.header.height"
              rx="6"
            />
            <rect
              class="box content"
              :x="visual.content.x"
              :y="visual.content.y"
              :width="visual.content.width"
              :height="visual.content.height"
              rx="6"
            />
            <rect
              class="box main"
              :x="visual.main.x"
              :y="visual.main.y"
              :width="visual.main.width"
              :height="visual.main.height"
              rx="6"
            />
            <text
              class="box-label"
              :x="visual.sidebar.x + visual.sidebar.width / 2"
              :y="visual.sidebar.y + visual.sidebar.height / 2"
            >
              sidebar
            </text>
            <text
              class="box-label"
              :x="visual.header.x + visual.header.width / 2"
              :y="visual.header.y + visual.header.height / 2"
            >
              header
            </text>
            <text
              class="box-label"
              :x="visual.content.x + visual.content.width / 2"
              :y="visual.content.y + visual.content.height / 2"
            >
              content
            </text>
          </svg>
        </div>

        <p v-else-if="!loadError" class="home-layout-status" aria-live="polite">
          Loading <code>@taffyjs/wasm</code>…
        </p>
        <p v-else class="home-layout-error" role="alert">
          The WebAssembly example could not start: {{ loadError }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-layout-showcase {
  max-width: 1152px;
  margin: 80px auto 0;
  padding: 0 0 64px;
}

.home-layout-copy {
  max-width: 680px;
  margin-bottom: 28px;
}

.home-layout-copy h2 {
  margin: 0 0 12px;
  border: 0;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.home-layout-copy p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 18px;
  line-height: 1.65;
}

.home-layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: 24px;
  align-items: stretch;
}

.home-layout-code,
.home-layout-result {
  min-width: 0;
}

.home-layout-code :deep(div[class*="language-"]) {
  height: 100%;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
}

.home-layout-code :deep(pre) {
  height: 100%;
  box-sizing: border-box;
}

.home-layout-result {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.home-layout-controls {
  display: grid;
  gap: 14px;
}

.home-layout-control {
  display: grid;
  gap: 6px;
}

.home-layout-control label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.home-layout-control output {
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.home-layout-control input {
  width: 100%;
  margin: 0;
}

.home-layout-canvas {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
}

.home-layout-root-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.home-layout-canvas svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 360px;
}

.box {
  vector-effect: non-scaling-stroke;
}

.box.root {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-1);
  stroke-width: 2;
}

.box.sidebar,
.box.header,
.box.content {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.5;
}

.box.header {
  fill: var(--vp-c-default-soft);
}

.box.main {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
  vector-effect: non-scaling-stroke;
}

.box-label {
  fill: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 18px;
  dominant-baseline: middle;
  text-anchor: middle;
}

.home-layout-status,
.home-layout-error {
  margin: auto 0;
  text-align: center;
}

.home-layout-status {
  color: var(--vp-c-text-2);
}

.home-layout-error {
  color: var(--vp-c-danger-1);
}

@media (max-width: 767px) {
  .home-layout-showcase {
    margin-top: 56px;
    padding: 0 0 48px;
  }

  .home-layout-copy h2 {
    font-size: 28px;
  }

  .home-layout-copy p {
    font-size: 16px;
  }

  .home-layout-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-layout-result {
    padding: 20px;
  }

  .home-layout-canvas {
    min-height: 220px;
  }
}
</style>
