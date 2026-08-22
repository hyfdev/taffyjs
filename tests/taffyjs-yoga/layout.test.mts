import assert from "node:assert/strict";
import Yoga, { Direction, Edge, FlexDirection } from "yoga-layout";
import OracleYoga, {
  Direction as OracleDirection,
  Edge as OracleEdge,
  FlexDirection as OracleFlexDirection,
} from "yoga-layout-oracle";
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

test("reversed-axis auto margins match Yoga", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setWidth(240);
    root.setHeight(100);
    root.setFlexDirection(FlexDirection.RowReverse);
    child.setWidth(60);
    child.setHeight(20);
    child.setMarginAuto(Edge.Left);
    root.insertChild(child, 0);
    oracleRoot.setWidth(240);
    oracleRoot.setHeight(100);
    oracleRoot.setFlexDirection(OracleFlexDirection.RowReverse);
    oracleChild.setWidth(60);
    oracleChild.setHeight(20);
    oracleChild.setMarginAuto(OracleEdge.Left);
    oracleRoot.insertChild(oracleChild, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.equal(child.getComputedLeft(), 180);
    assert.equal(child.getComputedLeft(), oracleChild.getComputedLeft());
    assert.equal(child.getComputedMargin(Edge.Left), 0);
    assert.equal(oracleChild.getComputedMargin(OracleEdge.Left), 0);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});
