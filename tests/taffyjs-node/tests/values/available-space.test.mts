import assert from "node:assert/strict";
import { AvailableSpace } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("variants", () => {
  assert.deepEqual(AvailableSpace.Definite(12), { kind: 0, value: 12 });
  assert.deepEqual(AvailableSpace.MinContent, { kind: 1 });
  assert.deepEqual(AvailableSpace.MaxContent, { kind: 2 });
  assert.deepEqual(Object.keys(AvailableSpace.Definite(12)), ["kind", "value"]);
  assert.deepEqual(Object.keys(AvailableSpace.MinContent), ["kind"]);
  assert.deepEqual(Object.keys(AvailableSpace.MaxContent), ["kind"]);
});

test("helper-materialization", () => {
  assert.equal(Object.isFrozen(AvailableSpace), true);
  assert.equal(Object.isFrozen(AvailableSpace.MinContent), true);
  assert.equal(Object.isFrozen(AvailableSpace.MaxContent), true);

  const first = AvailableSpace.Definite(1);
  const second = AvailableSpace.Definite(1);
  assert.notEqual(first, second);
  assert.equal(Object.isFrozen(first), false);
  first.value = 2;
  assert.deepEqual(first, { kind: 0, value: 2 });
  assert.deepEqual(second, { kind: 0, value: 1 });
});
