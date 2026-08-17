<script setup lang="ts">
import BenchmarkResults from "../.vitepress/components/BenchmarkResults.vue";
</script>

# Benchmarks

These measurements describe the current implementations, not their final performance potential; several known optimization opportunities have not yet been implemented.

These results compare complete public JavaScript layout transactions in Node.js. Every scenario runs through `@taffyjs/node`, `@taffyjs/wasm`, `@taffyjs/yoga`, `@taffyjs/yoga-wasm`, and `yoga-layout`. The two public API shapes use explicit implementations of the same semantic workload, including their real tree construction, conversion, layout, output-read, callback, and lifecycle costs.

Each scenario asks a different question and stands on its own. Relative throughput uses `yoga-layout` as the `1.00×` reference. Results from different scenarios are not combined into an overall score or winner.

<BenchmarkResults />
