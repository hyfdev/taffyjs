import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import { test } from "vite-plus/test";

import { expectedFailureByTitle } from "./yoga-official/expected-failures.ts";

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
  const registrations = new Map<string, { active: number; skipped: number }>();
  let caseCount = 0;
  let skippedCount = 0;
  const testPattern = /^test(?<skipped>\.skip)?\('(?<title>[^']+)'/gmu;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(testPattern)) {
      const title = match.groups?.title;
      assert.ok(title, `missing test title in ${file.pathname}`);
      caseCount += 1;
      const registration = registrations.get(title) ?? { active: 0, skipped: 0 };
      if (match.groups?.skipped === undefined) {
        registration.active += 1;
      } else {
        registration.skipped += 1;
        skippedCount += 1;
      }
      registrations.set(title, registration);
    }
  }

  assert.equal(files.length, 35);
  assert.equal(caseCount, 570);
  assert.equal(skippedCount, 17);

  for (const title of expectedFailureByTitle.keys()) {
    assert.deepEqual(
      registrations.get(title),
      { active: 1, skipped: 0 },
      `expected exactly one active and no skipped official test named ${title}`,
    );
  }
});
