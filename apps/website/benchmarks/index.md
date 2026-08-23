---
aside: false
---

<script setup lang="ts">
import BenchmarkResults from "../.vitepress/components/BenchmarkResults.vue";
</script>

# Benchmarks

These measurements describe the current implementations, not their final performance potential; several known optimization opportunities have not yet been implemented.

Each scenario names a transaction and measures every package that can express it. `+2.0×` is twice as fast as that scenario's reference, `-2.0×` takes twice as long; a dash means the package has no way to write the workload. Every number comes from one machine in one run, so compare the ratios rather than the milliseconds.

<BenchmarkResults />
