<script setup lang="ts">
import publishedResult from "../../../../benchmarks/results/published.json";

type ParameterValue = string | number | boolean;

interface BenchmarkTarget {
  readonly id: string;
  readonly label: string;
  readonly packageName: string;
}

interface BenchmarkResult {
  readonly targetId: string;
  readonly packageName: string;
  readonly hz: number;
  readonly meanMs: number;
  readonly medianMs: number;
}

interface BenchmarkScenario {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly description: string;
  readonly transaction: string;
  readonly parameters: Readonly<Record<string, ParameterValue>>;
  readonly results: readonly BenchmarkResult[];
}

interface BenchmarkComparisonGroup {
  readonly id: string;
  readonly targets: readonly BenchmarkTarget[];
  readonly scenarios: readonly BenchmarkScenario[];
}

interface BenchmarkReport {
  readonly schemaVersion: number;
  readonly generatedAt: string;
  readonly source: {
    readonly commit: string;
    readonly dirty: boolean;
  };
  readonly environment: {
    readonly node: string;
    readonly platform: string;
    readonly release: string;
    readonly arch: string;
    readonly cpu: string;
  };
  readonly profile: {
    readonly rounds: number;
    readonly maxRelativeMarginOfError: number | null;
    readonly maxRoundMedianSpread: number | null;
  };
  readonly comparisonGroups: readonly BenchmarkComparisonGroup[];
}

const report = publishedResult as BenchmarkReport;
if (report.schemaVersion !== 1) {
  throw new Error(`Unsupported benchmark result schema ${report.schemaVersion}`);
}
if (report.source.dirty) {
  throw new Error("Published benchmark results must come from a clean worktree");
}

const comparisonGroup = report.comparisonGroups.find(({ id }) => id === "taffy-api");
if (!comparisonGroup) {
  throw new Error("Published benchmark results are missing the Taffy API comparison");
}

const nodeTarget = comparisonGroup.targets.find(
  ({ packageName }) => packageName === "@taffyjs/node",
);
if (!nodeTarget) {
  throw new Error("Published benchmark results are missing @taffyjs/node");
}

const scenarios = comparisonGroup.scenarios.map((scenario) => {
  const nodeResult = scenario.results.find(({ targetId }) => targetId === nodeTarget.id);
  if (!nodeResult) {
    throw new Error(`${scenario.id} is missing its @taffyjs/node result`);
  }

  return {
    ...scenario,
    rows: comparisonGroup.targets.map((target) => {
      const result = scenario.results.find(({ targetId }) => targetId === target.id);
      if (!result) {
        throw new Error(`${scenario.id} is missing its ${target.packageName} result`);
      }
      return {
        target,
        result,
        relativeThroughput: result.hz / nodeResult.hz,
      };
    }),
  };
});

const throughputFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const durationFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const parameterFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

function formatParameterName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

function formatParameterValue(value: ParameterValue): string {
  return typeof value === "number" ? parameterFormatter.format(value) : String(value);
}

function formatGeneratedAt(value: string): string {
  return value.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

const operatingSystem =
  report.environment.platform === "darwin"
    ? `macOS (Darwin ${report.environment.release}, ${report.environment.arch})`
    : `${report.environment.platform} ${report.environment.release} (${report.environment.arch})`;
</script>

<template>
  <div class="benchmark-results">
    <p class="benchmark-method">
      The publication profile uses {{ report.profile.rounds }} isolated
      {{ report.profile.rounds === 1 ? "round" : "rounds" }} per target. Each round must stay at or
      below {{ report.profile.maxRelativeMarginOfError }}% relative margin of error<template
        v-if="report.profile.rounds > 1 && report.profile.maxRoundMedianSpread !== null"
        >, and the round medians must stay within {{ report.profile.maxRoundMedianSpread * 100 }}%
        of their median</template
      >.
    </p>

    <section
      v-for="scenario in scenarios"
      :key="scenario.id"
      class="benchmark-scenario"
      :aria-labelledby="`${scenario.id}-heading`"
    >
      <h2 :id="`${scenario.id}-heading`">{{ scenario.name }}</h2>
      <p class="benchmark-question">{{ scenario.question }}</p>
      <p class="benchmark-description">{{ scenario.description }}</p>

      <div class="benchmark-boundary">
        <div class="benchmark-boundary-item">
          <h3>Timed transaction</h3>
          <p>{{ scenario.transaction }}</p>
        </div>
        <div class="benchmark-boundary-item">
          <h3>Scale</h3>
          <dl class="benchmark-parameters">
            <div v-for="(value, name) in scenario.parameters" :key="name">
              <dt>{{ formatParameterName(name) }}</dt>
              <dd>{{ formatParameterValue(value) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        class="benchmark-table-region"
        role="region"
        :aria-label="`${scenario.name} results`"
        tabindex="0"
      >
        <table>
          <caption>
            {{
              scenario.name
            }}
            throughput and latency by package
          </caption>
          <thead>
            <tr>
              <th scope="col">Package</th>
              <th scope="col">ops/s</th>
              <th scope="col">Mean (ms)</th>
              <th scope="col">Median (ms)</th>
              <th scope="col">
                Relative throughput
                <span>Node = 1.00×</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in scenario.rows" :key="row.target.id">
              <th scope="row">
                <code>{{ row.target.packageName }}</code>
              </th>
              <td>{{ throughputFormatter.format(row.result.hz) }}</td>
              <td>{{ durationFormatter.format(row.result.meanMs) }}</td>
              <td>{{ durationFormatter.format(row.result.medianMs) }}</td>
              <td>{{ throughputFormatter.format(row.relativeThroughput) }}×</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="benchmark-run" aria-labelledby="benchmark-run-heading">
      <h2 id="benchmark-run-heading">Run details</h2>
      <dl>
        <div>
          <dt>Node.js</dt>
          <dd>{{ report.environment.node }}</dd>
        </div>
        <div>
          <dt>Operating system</dt>
          <dd>{{ operatingSystem }}</dd>
        </div>
        <div>
          <dt>CPU</dt>
          <dd>{{ report.environment.cpu }}</dd>
        </div>
        <div>
          <dt>Commit</dt>
          <dd>
            <code>{{ report.source.commit }}</code>
          </dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>
            <time :datetime="report.generatedAt">{{ formatGeneratedAt(report.generatedAt) }}</time>
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.benchmark-method {
  margin: 28px 0 8px;
  padding: 14px 18px;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.benchmark-scenario {
  margin-top: 44px;
  padding-top: 34px;
  border-top: 1px solid var(--vp-c-divider);
}

.benchmark-scenario h2 {
  margin: 0;
  padding: 0;
  border: 0;
}

.benchmark-question {
  margin: 10px 0 0;
  color: var(--vp-c-text-1);
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.55;
}

.benchmark-description {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.benchmark-boundary {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.benchmark-boundary-item {
  min-width: 0;
  padding: 18px 20px;
}

.benchmark-boundary-item + .benchmark-boundary-item {
  border-left: 1px solid var(--vp-c-divider);
}

.benchmark-boundary h3 {
  margin: 0 0 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.benchmark-boundary p {
  margin: 0;
  line-height: 1.65;
}

.benchmark-parameters {
  display: grid;
  gap: 7px;
  margin: 0;
}

.benchmark-parameters div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.benchmark-parameters dt {
  color: var(--vp-c-text-2);
}

.benchmark-parameters dd {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-variant-numeric: tabular-nums;
}

.benchmark-table-region {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  outline: none;
}

.benchmark-table-region:focus-visible {
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
}

.benchmark-table-region table {
  display: table;
  width: 100%;
  min-width: 680px;
  margin: 0;
  border-collapse: collapse;
}

.benchmark-table-region caption {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.benchmark-table-region th,
.benchmark-table-region td {
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: right;
  white-space: nowrap;
}

.benchmark-table-region thead th {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.benchmark-table-region thead span {
  display: block;
  margin-top: 2px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

.benchmark-table-region tbody tr:last-child th,
.benchmark-table-region tbody tr:last-child td {
  border-bottom: 0;
}

.benchmark-table-region th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: left;
}

.benchmark-table-region tbody th {
  background: var(--vp-c-bg);
}

.benchmark-table-region td {
  font-family: var(--vp-font-family-mono);
  font-variant-numeric: tabular-nums;
}

.benchmark-run {
  margin-top: 52px;
  padding-top: 30px;
  border-top: 1px solid var(--vp-c-divider);
}

.benchmark-run h2 {
  margin: 0 0 18px;
  padding: 0;
  border: 0;
}

.benchmark-run dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 28px;
  margin: 0;
}

.benchmark-run div {
  min-width: 0;
}

.benchmark-run dt {
  margin-bottom: 3px;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.benchmark-run dd {
  margin: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 700px) {
  .benchmark-boundary {
    grid-template-columns: minmax(0, 1fr);
  }

  .benchmark-boundary-item + .benchmark-boundary-item {
    border-top: 1px solid var(--vp-c-divider);
    border-left: 0;
  }

  .benchmark-table-region table {
    min-width: 640px;
  }

  .benchmark-run dl {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
