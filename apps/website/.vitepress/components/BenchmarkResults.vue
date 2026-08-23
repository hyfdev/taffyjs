<script setup lang="ts">
import { data } from "../benchmark-results.data";

const { scenarios, environment } = data;

const packages = [
  "yoga-layout",
  "@taffyjs/node",
  "@taffyjs/wasm",
  "@taffyjs/yoga",
  "@taffyjs/yoga-wasm",
] as const;

const overview = scenarios.map((scenario) => ({
  id: scenario.id,
  title: scenario.title,
  scale: scenario.scale,
  baselinePackageName: scenario.baselinePackageName,
  cells: packages.map((packageName) =>
    scenario.rows.find((row) => row.packageName === packageName),
  ),
}));

const rankedScenarios = scenarios.map((scenario) => ({
  ...scenario,
  rankedRows: [...scenario.rows].sort((left, right) => left.medianMs - right.medianMs),
}));

const errorFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const countFormatter = new Intl.NumberFormat("en-US");

function formatDuration(milliseconds: number): string {
  const digits = milliseconds >= 100 ? 0 : milliseconds >= 10 ? 1 : milliseconds >= 1 ? 2 : 3;
  return milliseconds.toFixed(digits);
}

function formatMagnitude(factor: number): string {
  if (factor >= 100) return String(Math.round(factor));
  if (factor >= 10) return factor.toFixed(0);
  return factor.toFixed(1);
}

function formatRelativeTime(row: { relativeTime: number; isBaseline: boolean }): string {
  if (row.isBaseline) return "1.00×";
  if (row.relativeTime >= 1) return `-${formatMagnitude(row.relativeTime)}×`;
  return `+${formatMagnitude(1 / row.relativeTime)}×`;
}

const operatingSystem =
  environment.platform === "darwin"
    ? `macOS (Darwin ${environment.release}, ${environment.arch})`
    : `${environment.platform} ${environment.release} (${environment.arch})`;
</script>

<template>
  <div class="benchmark">
    <div class="benchmark-scroll">
      <table class="benchmark-overview">
        <caption>
          Every scenario against every package
        </caption>
        <thead>
          <tr>
            <th scope="col" class="benchmark-scenario-name"></th>
            <th v-for="packageName in packages" :key="packageName" scope="col">
              <code>{{ packageName }}</code>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="scenario in overview" :key="scenario.id">
            <th scope="row" class="benchmark-scenario-name">
              <a :href="`#${scenario.id}`">{{ scenario.title }}</a>
              <em>{{ scenario.scale }}</em>
            </th>
            <td v-for="(cell, index) in scenario.cells" :key="index">
              <template v-if="cell">
                <span class="benchmark-relative">{{ formatRelativeTime(cell) }}</span>
                <span class="benchmark-absolute">{{ formatDuration(cell.medianMs) }} ms</span>
              </template>
              <span v-else class="benchmark-absent" title="This package cannot express the workload"
                >—</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section v-for="scenario in rankedScenarios" :key="scenario.id" class="benchmark-detail">
      <h2 :id="scenario.id">
        {{ scenario.title }}<span>{{ scenario.scale }}</span>
      </h2>
      <p class="benchmark-note">{{ scenario.description }}</p>
      <div class="benchmark-scroll">
        <table>
          <caption>
            {{
              scenario.title
            }}
            results by package
          </caption>
          <thead>
            <tr>
              <th scope="col" class="benchmark-package"></th>
              <th scope="col">
                vs
                <code>{{ scenario.baselinePackageName }}</code>
              </th>
              <th scope="col">Median</th>
              <th scope="col">p99</th>
              <th scope="col">Measure calls</th>
              <th scope="col">Values read</th>
              <th scope="col">± RME</th>
              <th scope="col">Samples</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in scenario.rankedRows"
              :key="row.targetId"
              :class="{ 'is-baseline': row.isBaseline }"
            >
              <th scope="row" class="benchmark-package">
                <code>{{ row.packageName }}</code>
              </th>
              <td class="benchmark-relative">{{ formatRelativeTime(row) }}</td>
              <td>{{ formatDuration(row.medianMs) }} ms</td>
              <td class="benchmark-dim">{{ formatDuration(row.p99Ms) }} ms</td>
              <td class="benchmark-dim">{{ countFormatter.format(row.measureCalls) }}</td>
              <td class="benchmark-dim">{{ countFormatter.format(row.readCount) }}</td>
              <td class="benchmark-dim">
                ±{{ errorFormatter.format(row.relativeMarginOfError) }}%
              </td>
              <td class="benchmark-dim">{{ row.sampleCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="benchmark-run">
      <span><b>CPU</b> {{ environment.cpu }}</span>
      <span><b>OS</b> {{ operatingSystem }}</span>
      <span><b>Node.js</b> {{ environment.node }}</span>
      <span><b>Commit</b> {{ data.commit.slice(0, 10) }}</span>
    </p>
  </div>
</template>

<style scoped>
.benchmark {
  margin-top: 28px;
}

.benchmark-scroll {
  overflow-x: auto;
}

.benchmark table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.benchmark tr,
.benchmark tr:nth-child(2n) {
  border-top: 0;
  background: transparent;
}

.benchmark th {
  background: transparent;
}

.benchmark code {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.benchmark code::before,
.benchmark code::after {
  content: none;
}

.benchmark caption {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.benchmark th,
.benchmark td {
  padding: 0 10px;
  border: 0;
  text-align: right;
}

.benchmark thead th {
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-text-3);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.3;
  vertical-align: bottom;
  white-space: nowrap;
}

.benchmark thead th code {
  font-size: 0.76rem;
}

.benchmark th.benchmark-package {
  width: 220px;
  padding-left: 0;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.benchmark tbody th.benchmark-package {
  border-bottom: 1px solid var(--vp-c-divider);
}

.benchmark th.benchmark-package code {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.benchmark tbody td {
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.benchmark tbody tr:hover th.benchmark-package,
.benchmark tbody tr:hover td {
  background: var(--vp-c-bg-soft);
}

.benchmark tbody tr.is-baseline th.benchmark-package,
.benchmark tbody tr.is-baseline td {
  border-bottom: 1px solid var(--vp-c-text-3);
  color: var(--vp-c-text-2);
}

.benchmark tbody tr:last-child th.benchmark-package,
.benchmark tbody tr:last-child td {
  border-bottom: 0;
}

.benchmark-dim {
  color: var(--vp-c-text-3);
}

.benchmark-overview {
  min-width: 900px;
  table-layout: fixed;
}

.benchmark th.benchmark-scenario-name {
  width: 260px;
  padding-left: 0;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--vp-c-divider);
}

.benchmark th.benchmark-scenario-name a {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.benchmark th.benchmark-scenario-name a:hover {
  color: var(--vp-c-brand-1);
}

.benchmark th.benchmark-scenario-name em {
  display: block;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  font-style: normal;
}

.benchmark-absent {
  color: var(--vp-c-text-3);
}

.benchmark-overview thead th {
  text-align: center;
  white-space: normal;
}

.benchmark-overview thead th code {
  font-size: 0.72rem;
}

.benchmark-overview td {
  height: 58px;
  text-align: center;
}

.benchmark-overview .benchmark-relative {
  display: block;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.15;
}

.benchmark-overview .benchmark-absolute {
  display: block;
  margin-top: 3px;
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
}

.benchmark-detail {
  margin-top: 34px;
}

.benchmark-detail h2 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 1.15rem;
  letter-spacing: -0.005em;
}

.benchmark-detail h2 span {
  margin-left: 8px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 400;
}

.benchmark-note {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.benchmark-detail table {
  min-width: 700px;
  margin-top: 10px;
}

.benchmark-detail td {
  height: 40px;
  font-size: 0.85rem;
}

.benchmark-detail td.benchmark-relative {
  font-weight: 600;
}

.benchmark-run {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  margin: 40px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
}

.benchmark-run b {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-weight: 500;
}

@media (max-width: 640px) {
  .benchmark th.benchmark-package {
    width: 170px;
  }
}
</style>
