import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type AvailableSpaceHelper = Readonly<{
  Definite(value: number): { kind: number; value: number };
  MinContent: Readonly<{ kind: number }>;
  MaxContent: Readonly<{ kind: number }>;
}>;

function availableSpace(): AvailableSpaceHelper {
  const value = Reflect.get(api, "AvailableSpace");
  assert.equal(typeof value, "object", "AvailableSpace is exported");
  assert.notEqual(value, null, "AvailableSpace is exported");
  return value as AvailableSpaceHelper;
}

test("variants", () => {
  const AvailableSpace = availableSpace();
  assert.deepEqual(AvailableSpace.Definite(12), { kind: 0, value: 12 });
  assert.deepEqual(AvailableSpace.MinContent, { kind: 1 });
  assert.deepEqual(AvailableSpace.MaxContent, { kind: 2 });
  assert.deepEqual(Object.keys(AvailableSpace.Definite(12)), ["kind", "value"]);
  assert.deepEqual(Object.keys(AvailableSpace.MinContent), ["kind"]);
  assert.deepEqual(Object.keys(AvailableSpace.MaxContent), ["kind"]);
});

test("helper-materialization", () => {
  const AvailableSpace = availableSpace();
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
