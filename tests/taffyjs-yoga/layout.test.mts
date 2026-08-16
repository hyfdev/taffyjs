import assert from "node:assert/strict";
import Yoga, { Direction } from "yoga-layout";
import OracleYoga, { Direction as OracleDirection } from "yoga-layout-oracle";
import { test } from "vite-plus/test";

test("create-set-calculate-read matches Yoga for a fixed leaf", () => {
  const node = Yoga.Node.create();
  const oracleNode = OracleYoga.Node.create();
  try {
    node.setWidth(100);
    node.setHeight(40);
    node.calculateLayout(undefined, undefined, Direction.LTR);

    oracleNode.setWidth(100);
    oracleNode.setHeight(40);
    oracleNode.calculateLayout(undefined, undefined, OracleDirection.LTR);

    assert.deepEqual(node.getComputedLayout(), oracleNode.getComputedLayout());
    assert.equal(node.getComputedWidth(), oracleNode.getComputedWidth());
    assert.equal(node.getComputedHeight(), oracleNode.getComputedHeight());
  } finally {
    node.free();
    oracleNode.free();
  }
});
