import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function asciiCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export default class ContractReporter {
  results = [];

  onTestCaseResult(testCase) {
    const result = testCase.result();
    const moduleId = testCase.module.moduleId;
    const modulePath = moduleId.startsWith("file:") ? fileURLToPath(moduleId) : moduleId;
    const retried = result.state === "passed" && (result.errors?.length ?? 0) !== 0;
    this.results.push({
      acceptanceId: testCase.name,
      path: relative(root, modulePath).replaceAll("\\", "/"),
      result: result.state === "passed" && !retried ? "pass" : retried ? "retried" : result.state,
    });
  }

  onTestRunEnd(_testModules, unhandledErrors, reason) {
    this.results.sort((left, right) => asciiCompare(left.acceptanceId, right.acceptanceId));
    process.stdout.write(
      `${JSON.stringify({
        schemaVersion: 1,
        reason,
        unhandledErrorCount: unhandledErrors.length,
        results: this.results,
      })}\n`,
    );
    const ids = this.results.map(({ acceptanceId }) => acceptanceId);
    if (
      reason !== "passed" ||
      unhandledErrors.length !== 0 ||
      this.results.length === 0 ||
      new Set(ids).size !== ids.length ||
      this.results.some(({ result }) => result !== "pass")
    ) {
      process.exitCode = 1;
    }
  }
}
