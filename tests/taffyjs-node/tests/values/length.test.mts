import assert from "node:assert/strict";
import { Dimension } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("forms", () => {
  const length = Dimension.Length(12);
  const percent = Dimension.Percent(50);
  assert.deepEqual(length, { unit: 0, value: 12 });
  assert.deepEqual(percent, { unit: 1, value: 50 });
  assert.deepEqual(Dimension.Auto, { unit: 2 });
  assert.deepEqual(Object.keys(length), ["unit", "value"]);
  assert.deepEqual(Object.keys(percent), ["unit", "value"]);
  assert.deepEqual(Object.keys(Dimension.Auto), ["unit"]);
});

test("helper-materialization", () => {
  assert.equal(Object.isFrozen(Dimension), true);
  assert.equal(Object.isFrozen(Dimension.Auto), true);
  assert.equal(Dimension.Auto, Dimension.Auto);

  const first = Dimension.Length(1);
  const second = Dimension.Length(1);
  const percent = Dimension.Percent(1);
  assert.notEqual(first, second);
  assert.equal(Object.isFrozen(first), false);
  assert.equal(Object.isFrozen(percent), false);
  first.value = 2;
  percent.value = 3;
  assert.deepEqual(first, { unit: 0, value: 2 });
  assert.deepEqual(second, { unit: 0, value: 1 });
  assert.deepEqual(percent, { unit: 1, value: 3 });
});
