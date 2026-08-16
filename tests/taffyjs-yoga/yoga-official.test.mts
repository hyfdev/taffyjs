import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import { test } from "vite-plus/test";

import {
  expectedFailureByTitle,
  expectedFailureGroups,
} from "./yoga-official/expected-failures.ts";

const officialTestRoot = new URL("./yoga-official/tests/", import.meta.url);

test("official Yoga snapshot and expected failures stay aligned", async () => {
  const files = (
    await Promise.all(
      [new URL(".", officialTestRoot), new URL("generated/", officialTestRoot)].map(
        async (directory) =>
          (await readdir(directory))
            .filter((name) => name.endsWith(".test.ts"))
            .map((name) => new URL(name, directory)),
      ),
    )
  ).flat();
  const titleCounts = new Map<string, number>();
  let caseCount = 0;
  let skippedCount = 0;
  const testPattern = /^test(?<skipped>\.skip)?\('(?<title>[^']+)'/gmu;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(testPattern)) {
      const title = match.groups?.title;
      assert.ok(title, `missing test title in ${file.pathname}`);
      caseCount += 1;
      if (match.groups?.skipped !== undefined) skippedCount += 1;
      titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
    }
  }

  assert.equal(files.length, 35);
  assert.equal(caseCount, 570);
  assert.equal(skippedCount, 17);
  assert.equal(expectedFailureByTitle.size, 85);
  assert.equal(
    expectedFailureGroups
      .filter((group) => group.classification === "unsupported")
      .flatMap((group) => group.titles).length,
    77,
  );
  assert.equal(
    expectedFailureGroups
      .filter((group) => group.classification === "different")
      .flatMap((group) => group.titles).length,
    8,
  );

  for (const title of expectedFailureByTitle.keys()) {
    assert.equal(titleCounts.get(title), 1, `expected one official test named ${title}`);
  }
});
