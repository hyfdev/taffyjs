<script setup lang="ts">
import BenchmarkResults from "../.vitepress/components/BenchmarkResults.vue";
</script>

# Benchmarks

These measurements describe the current implementations, not their final performance potential; several known optimization opportunities have not yet been implemented.

These results compare complete public JavaScript transactions in Node.js. The Taffy API group compares `@taffyjs/node` with `@taffyjs/wasm`. The Yoga API group compares packages through the same Yoga-shaped API. Each transaction starts after package import and includes public tree construction, data conversion, layout computation, reading the requested layout results, and any lifecycle work required by that API.

Each scenario asks a different question and stands on its own. Relative throughput uses the first target as the `1.00×` reference within its own API group. Results from different APIs or scenarios are not combined into an overall score or winner.

<BenchmarkResults />
