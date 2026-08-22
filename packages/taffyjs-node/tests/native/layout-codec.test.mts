import assert from "node:assert/strict";
import { BindingTaffyTree } from "../../src/binding.ts";
import { layoutCodecByteLength, layoutCodecLength, decodeLayout } from "../../src/layout-codec.ts";
import { withEncodedStyle } from "../../src/style-input.ts";
import { test } from "vite-plus/test";

function captureError(operation: () => void): { code?: string } {
  try {
    operation();
  } catch (error) {
    return error as { code?: string };
  }
  throw new Error("Expected the operation to throw");
}

function laidOutOwner() {
  const owner = new BindingTaffyTree();
  const node = withEncodedStyle(
    { size: { width: 120, height: 80 }, margin: { left: 5 } },
    (encoded) => owner.rawNewLeaf(encoded),
  );
  owner.rawComputeLayout(node, { width: { kind: 0, value: 400 }, height: { kind: 0, value: 400 } });
  return { owner, node };
}

test("Layout writers reject an output buffer of the wrong length", () => {
  const { owner, node } = laidOutOwner();
  for (const length of [0, layoutCodecLength - 1, layoutCodecLength + 1]) {
    for (const writer of ["rawWriteLayout", "rawWriteUnroundedLayout"] as const) {
      assert.throws(
        () => owner[writer](node, new Float64Array(length)),
        new RegExp(`Layout output must contain exactly ${layoutCodecLength} values`, "u"),
        `${writer} with length ${length}`,
      );
    }
  }
});

test("Layout writers reject a buffer that is not a Float64Array", () => {
  const { owner, node } = laidOutOwner();
  // napi-rs reports both a wrong element type and a non-typed-array as InvalidArg, and only the
  // status code carries a stable meaning, so only the code is asserted.
  for (const value of [
    new Float32Array(layoutCodecLength),
    Array.from({ length: layoutCodecLength }, () => 0),
    layoutCodecLength,
  ]) {
    assert.equal(captureError(() => owner.rawWriteLayout(node, value as never)).code, "InvalidArg");
  }
});

test("Layout writers fill every slot of the caller's buffer", () => {
  const { owner, node } = laidOutOwner();
  const output = new Float64Array(new ArrayBuffer(layoutCodecByteLength)).fill(Number.NaN);
  owner.rawWriteLayout(node, output);
  assert.equal(
    output.some((value) => Number.isNaN(value)),
    false,
  );
  assert.deepEqual(decodeLayout(output).size, { width: 120, height: 80 });
  assert.equal(decodeLayout(output).margin.left, 5);
});
