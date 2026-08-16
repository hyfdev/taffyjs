<script setup>
import { onMounted, ref } from "vue";

const availableWidth = ref(100);
const firstWidth = ref(null);
const secondWidth = ref(null);
const secondX = ref(null);
const loadError = ref("");
const ready = ref(false);

let computeWidthLayout;

function compute() {
  if (!computeWidthLayout) return;

  const { first, second } = computeWidthLayout(availableWidth.value);
  firstWidth.value = first.size.width;
  secondWidth.value = second.size.width;
  secondX.value = second.location.x;
}

onMounted(async () => {
  try {
    ({ computeWidthLayout } = await import("../../examples/getting-started-width.js"));
    compute();
    ready.value = true;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<template>
  <div class="layout-demo">
    <div class="layout-demo-code" aria-label="Read-only TaffyJS example code">
      <slot />
    </div>

    <div class="layout-demo-result">
      <label for="layout-demo-width">
        Available width: <strong>{{ availableWidth }}</strong>
      </label>
      <input
        id="layout-demo-width"
        v-model.number="availableWidth"
        type="range"
        min="100"
        max="300"
        step="10"
        :disabled="!ready"
        @input="compute"
      />

      <div v-if="ready" class="layout-demo-stage">
        <div class="layout-demo-row" :style="{ width: `${availableWidth}px` }">
          <div class="layout-demo-item" :style="{ width: `${firstWidth}px` }">
            {{ firstWidth }}
          </div>
          <div
            class="layout-demo-item second"
            :style="{ left: `${secondX}px`, width: `${secondWidth}px` }"
          >
            {{ secondWidth }}
          </div>
        </div>
      </div>

      <p v-if="!ready && !loadError" class="layout-demo-status" aria-live="polite">
        Loading <code>@taffyjs/wasm</code>…
      </p>
      <output v-else-if="ready" aria-live="polite">
        First item width: {{ firstWidth }}; second item x: {{ secondX }}
      </output>
      <p v-else class="layout-demo-error" role="alert">
        The WebAssembly example could not start: {{ loadError }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.layout-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 0;
}

.layout-demo-code,
.layout-demo-result {
  min-width: 0;
}

.layout-demo-code :deep(div[class*="language-"]) {
  height: 100%;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
}

.layout-demo-code :deep(pre) {
  height: 100%;
  box-sizing: border-box;
}

.layout-demo-result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.layout-demo label,
.layout-demo output {
  display: block;
}

.layout-demo input {
  width: min(100%, 300px);
  margin: 12px 0 20px;
}

.layout-demo-stage {
  min-height: 56px;
  overflow-x: auto;
}

.layout-demo-row {
  position: relative;
  height: 40px;
  border: 2px solid var(--vp-c-brand-1);
  box-sizing: content-box;
}

.layout-demo-item {
  position: absolute;
  inset: 0 auto 0 0;
  display: grid;
  place-items: center;
  border-right: 1px solid var(--vp-c-brand-1);
  box-sizing: border-box;
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-soft);
  font-variant-numeric: tabular-nums;
}

.layout-demo-item.second {
  border-right: 0;
}

.layout-demo output {
  margin-top: 12px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.layout-demo-status {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
}

.layout-demo-error {
  margin: 12px 0 0;
  color: var(--vp-c-danger-1);
}

@media (max-width: 767px) {
  .layout-demo {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
