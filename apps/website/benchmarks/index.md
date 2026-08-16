<script setup lang="ts">
import BenchmarkResults from "../.vitepress/components/BenchmarkResults.vue";
</script>

# Node vs. Wasm

These results compare `@taffyjs/node` and `@taffyjs/wasm` in Node.js through the same public JavaScript API. Each timed end-to-end transaction starts after package import and includes public tree construction, JavaScript-to-native or JavaScript-to-Wasm data conversion, layout computation, and reading the requested layout results. The benchmark does not isolate engine time or subtract wrapper overhead.

Each scenario asks a different question and stands on its own. Relative throughput uses `@taffyjs/node` as the `1.00×` reference within that scenario; the results are not combined into an overall score or winner.

<BenchmarkResults />
