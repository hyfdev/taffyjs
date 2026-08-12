import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as api from "@taffyjs/node";
import { contractTests } from "../tests/contract-test.mts";

const projectionRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(projectionRoot, "../../..");
const metadata = JSON.parse(await readFile(resolve(projectionRoot, "metadata.json"), "utf8"));
const asciiCompare = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

for (const path of metadata.testPaths) {
  await import(pathToFileURL(resolve(repositoryRoot, path)).href);
}

const expectedIds = metadata.secondary.map(({ id }) => id).sort(asciiCompare);
const actualIds = contractTests.map(({ id }) => id).sort(asciiCompare);
assert.equal(contractTests.length, expectedIds.length);
assert.equal(new Set(actualIds).size, actualIds.length);
assert.deepEqual(actualIds, expectedIds);

const byId = new Map(contractTests.map((test) => [test.id, test]));
const secondaryResults = [];
for (const id of expectedIds) {
  await byId.get(id).body();
  secondaryResults.push({ identity: `${id}::node-22.18.0`, result: "pass" });
}

function invokesMember(body, name) {
  const source = Function.prototype.toString.call(body);
  if (name === "constructor") return /\bnew\s+(?:\([^)]*\)|[A-Za-z_$])/u.test(source);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(?:\\.|\\?\\.|["'])${escaped}(?:["']\\]|)\\s*\\(`, "u").test(source);
}

const passedIds = new Set(expectedIds);
const surfaceProbeResults = [];
for (const [owner, names] of Object.entries(metadata.runtimeExportsByOwner)) {
  for (const name of names) {
    const value = api[name];
    if (name === "TaffyTree") {
      assert.equal(typeof value, "function");
      const tree = new value();
      assert.equal(tree.getNodeCount(), 0);
    } else if (Object.hasOwn(metadata.numericFamilies, name)) {
      assert.equal(typeof value, "object");
      assert.notEqual(value, null);
      assert.equal(Object.isFrozen(value), true);
      const members = metadata.numericFamilies[name];
      assert.deepEqual(Object.keys(value), members);
      assert.deepEqual(Object.fromEntries(members.map((member, code) => [member, code])), value);
    } else {
      const required = metadata.helperCoverage[name];
      assert.ok(required, `Missing helper coverage for ${name}`);
      assert.equal(typeof value, "object");
      assert.notEqual(value, null);
      assert.equal(Object.isFrozen(value), true);
      assert.ok(required.every((id) => passedIds.has(id)));
    }
    surfaceProbeResults.push({
      identity: `MATURITY-002/minimum-node::surface/runtime-export/${owner}/${name}`,
      result: "pass",
    });
  }
}

for (const [owner, names] of Object.entries(metadata.classMembersByOwner)) {
  const ownerTests = metadata.secondary.filter((record) => record.owner === owner);
  for (const name of names) {
    const source = ownerTests.find(({ id }) => invokesMember(byId.get(id).body, name));
    assert.ok(source, `No executed ${owner} acceptance invokes ${name}`);
    assert.ok(passedIds.has(source.id));
    surfaceProbeResults.push({
      identity: `MATURITY-002/minimum-node::surface/class-member/${owner}/${name}`,
      result: "pass",
      sourceAcceptanceId: source.id,
    });
  }
}

secondaryResults.sort((left, right) => asciiCompare(left.identity, right.identity));
surfaceProbeResults.sort((left, right) => asciiCompare(left.identity, right.identity));
assert.equal(secondaryResults.length, 816);
assert.equal(surfaceProbeResults.length, 58);

process.stdout.write(
  `${JSON.stringify({
    runtime: process.version,
    resolvedPackageUrl: import.meta.resolve("@taffyjs/node"),
    secondaryResults,
    surfaceProbeResults,
  })}\n`,
);
