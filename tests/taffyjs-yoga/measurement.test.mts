import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Yoga, { FlexDirection, MeasureMode, type MeasureFunction } from "yoga-layout";
import OracleYoga, {
  FlexDirection as OracleFlexDirection,
  MeasureMode as OracleMeasureMode,
} from "yoga-layout-oracle";
import { test } from "vite-plus/test";

type CallbackCall = readonly [number, number, number, number];

function layoutSize(node: {
  getComputedWidth(): number;
  getComputedHeight(): number;
}): readonly [number, number] {
  return [node.getComputedWidth(), node.getComputedHeight()];
}

function captureThrown(body: () => unknown): unknown {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

test("ordinary measured roots preserve Yoga constraints, normalization, and text rounding", () => {
  for (const Implementation of [Yoga, OracleYoga]) {
    const node = Implementation.Node.create();
    const calls: CallbackCall[] = [];
    node.setMeasureFunc((width, widthMode, height, heightMode) => {
      calls.push([width, widthMode, height, heightMode]);
      return { width: 23.25, height: 11.5 };
    });
    node.calculateLayout(undefined, undefined);
    assert.deepEqual(calls, [
      [
        Number.NaN,
        Implementation.MEASURE_MODE_UNDEFINED,
        Number.NaN,
        Implementation.MEASURE_MODE_UNDEFINED,
      ],
    ]);
    assert.deepEqual(layoutSize(node), [24, 12]);
    node.free();
  }

  for (const Implementation of [Yoga, OracleYoga]) {
    const node = Implementation.Node.create();
    const calls: CallbackCall[] = [];
    node.setMaxWidth(15);
    node.setPadding(Implementation.EDGE_ALL, 10);
    node.setMeasureFunc((width, widthMode, height, heightMode) => {
      calls.push([width, widthMode, height, heightMode]);
      return { width: 30, height: width < 0 ? 50 : 10 };
    });
    node.calculateLayout(100, undefined);
    assert.deepEqual(calls, [
      [0, Implementation.MEASURE_MODE_AT_MOST, Number.NaN, Implementation.MEASURE_MODE_UNDEFINED],
    ]);
    assert.deepEqual(layoutSize(node), [20, 30]);
    node.free();
  }

  const config = Yoga.Config.create();
  const measuredText = Yoga.Node.createWithConfig(config);
  const oracleConfig = OracleYoga.Config.create();
  const oracleMeasuredText = OracleYoga.Node.createWithConfig(oracleConfig);
  config.setPointScaleFactor(2);
  oracleConfig.setPointScaleFactor(2);
  measuredText.setMeasureFunc(() => ({ width: 10.1, height: 5.1 }));
  oracleMeasuredText.setMeasureFunc(() => ({ width: 10.1, height: 5.1 }));
  measuredText.calculateLayout(undefined, undefined);
  oracleMeasuredText.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(measuredText), [10.5, 5.5]);
  assert.deepEqual(layoutSize(measuredText), layoutSize(oracleMeasuredText));
  measuredText.free();
  oracleMeasuredText.free();
  config.free();
  oracleConfig.free();

  for (const Implementation of [Yoga, OracleYoga]) {
    const node = Implementation.Node.create();
    const calls: CallbackCall[] = [];
    node.setPadding(Implementation.EDGE_ALL, 10);
    node.setMeasureFunc((width, widthMode, height, heightMode) => {
      calls.push([width, widthMode, height, heightMode]);
      return { width: 30, height: 10 };
    });
    node.calculateLayout(5, undefined);
    assert.deepEqual(calls, [
      [0, Implementation.MEASURE_MODE_EXACTLY, Number.NaN, Implementation.MEASURE_MODE_UNDEFINED],
    ]);
    assert.deepEqual(layoutSize(node), [20, 30]);
    node.free();
  }

  const normalizedResults: readonly unknown[] = [
    { width: "7.5", height: undefined },
    { width: Number.NaN, height: -2 },
    { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY },
  ];
  for (const result of normalizedResults) {
    const node = Yoga.Node.create();
    const oracle = OracleYoga.Node.create();
    node.setMeasureFunc(() => result as never);
    oracle.setMeasureFunc(() => result as never);
    node.calculateLayout(undefined, undefined);
    oracle.calculateLayout(undefined, undefined);
    assert.deepEqual(layoutSize(node), layoutSize(oracle));
    node.free();
    oracle.free();
  }
});

test("markDirty refreshes captured measurement data", () => {
  for (const Implementation of [Yoga, OracleYoga]) {
    const node = Implementation.Node.create();
    let width = 10;
    let calls = 0;
    node.setMeasureFunc(() => {
      calls += 1;
      return { width, height: 3 };
    });
    node.calculateLayout(undefined, undefined);
    const firstCalls = calls;
    width = 20;
    node.calculateLayout(undefined, undefined);
    assert.deepEqual(layoutSize(node), [10, 3]);
    assert.equal(calls, firstCalls);
    node.markDirty();
    node.calculateLayout(undefined, undefined);
    assert.deepEqual(layoutSize(node), [20, 3]);
    assert.ok(calls > firstCalls);
    node.free();
  }
});

test("constant measurement matches Yoga while callback traces remain deliberately different", () => {
  const root = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleRoot = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  const calls: CallbackCall[] = [];
  const oracleCalls: CallbackCall[] = [];

  root.setWidth(100);
  root.setHeight(40);
  root.setFlexDirection(FlexDirection.Row);
  oracleRoot.setWidth(100);
  oracleRoot.setHeight(40);
  oracleRoot.setFlexDirection(OracleFlexDirection.Row);
  child.setMeasureFunc((...args) => {
    calls.push(args);
    return { width: 30, height: 10 };
  });
  oracleChild.setMeasureFunc((...args) => {
    oracleCalls.push(args);
    return { width: 30, height: 10 };
  });
  root.insertChild(child, 0);
  oracleRoot.insertChild(oracleChild, 0);
  root.calculateLayout(undefined, undefined);
  oracleRoot.calculateLayout(undefined, undefined);

  assert.deepEqual(layoutSize(child), [30, 40]);
  assert.deepEqual(layoutSize(child), layoutSize(oracleChild));
  assert.deepEqual(calls, [
    [Number.NaN, MeasureMode.Undefined, 40, MeasureMode.Exactly],
    [0, MeasureMode.AtMost, 40, MeasureMode.Exactly],
    [30, MeasureMode.Exactly, 40, MeasureMode.AtMost],
    [30, MeasureMode.AtMost, 40, MeasureMode.AtMost],
  ]);
  assert.deepEqual(oracleCalls, [[100, OracleMeasureMode.AtMost, 40, OracleMeasureMode.Exactly]]);

  root.freeRecursive();
  oracleRoot.freeRecursive();
});

test("MeasureMode-sensitive layout differs while constant measured flex basis matches Yoga", () => {
  const modeSensitive: MeasureFunction = (width, widthMode) => ({
    width: widthMode === MeasureMode.Undefined ? 80 : widthMode === MeasureMode.AtMost ? 20 : width,
    height: 10,
  });
  const oracleModeSensitive = (width: number, widthMode: OracleMeasureMode) => ({
    width:
      widthMode === OracleMeasureMode.Undefined
        ? 80
        : widthMode === OracleMeasureMode.AtMost
          ? 20
          : width,
    height: 10,
  });

  const root = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleRoot = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  root.setWidth(100);
  root.setHeight(40);
  root.setFlexDirection(FlexDirection.Row);
  oracleRoot.setWidth(100);
  oracleRoot.setHeight(40);
  oracleRoot.setFlexDirection(OracleFlexDirection.Row);
  child.setMeasureFunc(modeSensitive);
  oracleChild.setMeasureFunc(oracleModeSensitive);
  root.insertChild(child, 0);
  oracleRoot.insertChild(oracleChild, 0);
  root.calculateLayout(undefined, undefined);
  oracleRoot.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(child), [80, 40]);
  assert.deepEqual(layoutSize(oracleChild), [20, 40]);
  root.freeRecursive();
  oracleRoot.freeRecursive();

  const basisRoot = Yoga.Node.create();
  const basisChild = Yoga.Node.create();
  const oracleBasisRoot = OracleYoga.Node.create();
  const oracleBasisChild = OracleYoga.Node.create();
  basisRoot.setWidth(100);
  basisRoot.setFlexDirection(FlexDirection.Row);
  oracleBasisRoot.setWidth(100);
  oracleBasisRoot.setFlexDirection(OracleFlexDirection.Row);
  basisChild.setFlexBasis(20);
  oracleBasisChild.setFlexBasis(20);
  basisChild.setMeasureFunc(() => ({ width: 30, height: 10 }));
  oracleBasisChild.setMeasureFunc(() => ({ width: 30, height: 10 }));
  basisRoot.insertChild(basisChild, 0);
  oracleBasisRoot.insertChild(oracleBasisChild, 0);
  basisRoot.calculateLayout(undefined, undefined);
  oracleBasisRoot.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(basisChild), [20, 10]);
  assert.deepEqual(layoutSize(basisChild), layoutSize(oracleBasisChild));
  basisRoot.freeRecursive();
  oracleBasisRoot.freeRecursive();
});

test("measurement failure preserves public output and thrown identity, then retries atomically", () => {
  const node = Yoga.Node.create();
  node.setMeasureFunc(() => ({ width: 10, height: 5 }));
  node.calculateLayout(undefined, undefined);
  node.markLayoutSeen();

  const sentinel = { reason: "retry" };
  let shouldThrow = true;
  node.setMeasureFunc(() => {
    if (shouldThrow) throw sentinel;
    return { width: 20, height: 8 };
  });
  assert.deepEqual(
    [node.isDirty(), node.hasNewLayout(), ...layoutSize(node)],
    [false, false, 10, 5],
  );
  assert.equal(
    captureThrown(() => node.calculateLayout(undefined, undefined)),
    sentinel,
  );
  assert.deepEqual(
    [node.isDirty(), node.hasNewLayout(), ...layoutSize(node)],
    [false, false, 10, 5],
  );

  shouldThrow = false;
  node.calculateLayout(undefined, undefined);
  assert.deepEqual(
    [node.isDirty(), node.hasNewLayout(), ...layoutSize(node)],
    [false, true, 20, 8],
  );

  node.setMeasureFunc(() => null as never);
  const invalid = captureThrown(() => node.calculateLayout(undefined, undefined));
  assert.equal((invalid as Error).constructor, TypeError);
  assert.deepEqual(layoutSize(node), [20, 8]);
  node.setMeasureFunc(() => ({ width: 6, height: 4 }));
  node.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(node), [6, 4]);
  node.free();
});

test("measurement failure restores a temporary exact root Style before retry", () => {
  const node = Yoga.Node.create();
  node.setMeasureFunc(() => ({ width: 10, height: 5 }));
  node.calculateLayout(undefined, undefined);
  node.markLayoutSeen();

  const sentinel = { reason: "exact-root" };
  let shouldThrow = true;
  node.setMeasureFunc(() => {
    if (shouldThrow) throw sentinel;
    return { width: 20, height: 8 };
  });
  assert.equal(
    captureThrown(() => node.calculateLayout(40, undefined)),
    sentinel,
  );
  assert.deepEqual(node.getWidth(), { value: Number.NaN, unit: Yoga.UNIT_AUTO });
  assert.deepEqual(
    [node.isDirty(), node.hasNewLayout(), ...layoutSize(node)],
    [false, false, 10, 5],
  );

  shouldThrow = false;
  node.calculateLayout(40, undefined);
  assert.deepEqual(node.getWidth(), { value: Number.NaN, unit: Yoga.UNIT_AUTO });
  assert.deepEqual(
    [node.isDirty(), node.hasNewLayout(), ...layoutSize(node)],
    [false, true, 40, 8],
  );
  node.free();
});

test("a failed Config refresh remains visible to descendant new-layout state on retry", () => {
  const config = Yoga.Config.create();
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const sentinel = { source: "candidate" };
  let shouldThrow = false;
  child.setMeasureFunc(() => {
    if (shouldThrow) throw sentinel;
    return { width: 10.1, height: 5.1 };
  });
  root.insertChild(child, 0);
  root.calculateLayout(undefined, undefined);
  root.markLayoutSeen();
  child.markLayoutSeen();
  config.setPointScaleFactor(2);
  shouldThrow = true;
  assert.equal(
    captureThrown(() => root.calculateLayout(undefined, undefined)),
    sentinel,
  );
  assert.deepEqual(
    [root.hasNewLayout(), child.hasNewLayout(), ...layoutSize(child)],
    [false, false, 11, 6],
  );
  shouldThrow = false;
  root.calculateLayout(undefined, undefined);
  assert.deepEqual(
    [root.hasNewLayout(), child.hasNewLayout(), ...layoutSize(child)],
    [true, true, 10.5, 5.5],
  );

  const oracleConfig = OracleYoga.Config.create();
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleSentinel = { source: "oracle" };
  let oracleShouldThrow = false;
  oracleChild.setMeasureFunc(() => {
    if (oracleShouldThrow) throw oracleSentinel;
    return { width: 10.1, height: 5.1 };
  });
  oracleRoot.insertChild(oracleChild, 0);
  oracleRoot.calculateLayout(undefined, undefined);
  oracleRoot.markLayoutSeen();
  oracleChild.markLayoutSeen();
  oracleConfig.setPointScaleFactor(2);
  oracleShouldThrow = true;
  assert.equal(
    captureThrown(() => oracleRoot.calculateLayout(undefined, undefined)),
    oracleSentinel,
  );
  assert.deepEqual(
    [oracleRoot.hasNewLayout(), oracleChild.hasNewLayout(), ...layoutSize(oracleChild)],
    [false, false, 11, 6],
  );
  oracleShouldThrow = false;
  oracleRoot.calculateLayout(undefined, undefined);
  assert.deepEqual(
    [oracleRoot.hasNewLayout(), oracleChild.hasNewLayout(), ...layoutSize(oracleChild)],
    [true, true, 10.5, 5.5],
  );

  root.freeRecursive();
  oracleRoot.freeRecursive();
  config.free();
  oracleConfig.free();
});

test("callback replacement and removal deliberately invalidate native measurement caches", () => {
  const node = Yoga.Node.create();
  const oracle = OracleYoga.Node.create();
  node.setMeasureFunc(() => ({ width: 10, height: 2 }));
  oracle.setMeasureFunc(() => ({ width: 10, height: 2 }));
  node.calculateLayout(undefined, undefined);
  oracle.calculateLayout(undefined, undefined);
  node.markLayoutSeen();
  oracle.markLayoutSeen();

  node.setMeasureFunc(() => ({ width: 20, height: 2 }));
  oracle.setMeasureFunc(() => ({ width: 20, height: 2 }));
  assert.deepEqual([node.isDirty(), node.hasNewLayout()], [false, false]);
  assert.deepEqual([oracle.isDirty(), oracle.hasNewLayout()], [false, false]);
  node.calculateLayout(undefined, undefined);
  oracle.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(node), [20, 2]);
  assert.deepEqual(layoutSize(oracle), [10, 2]);

  node.unsetMeasureFunc();
  oracle.unsetMeasureFunc();
  node.calculateLayout(undefined, undefined);
  oracle.calculateLayout(undefined, undefined);
  assert.deepEqual(layoutSize(node), [0, 0]);
  assert.deepEqual(layoutSize(oracle), [10, 2]);
  node.free();
  oracle.free();
});

test("same-facade native reentrancy fails before mutation while JavaScript getters remain usable", () => {
  const node = Yoga.Node.create();
  let busyError: unknown;
  node.setMeasureFunc(() => {
    assert.deepEqual(node.getWidth(), { value: Number.NaN, unit: Yoga.UNIT_AUTO });
    busyError = captureThrown(() => node.setWidth(12));
    return { width: 7, height: 3 };
  });
  node.calculateLayout(undefined, undefined);
  assert.equal((busyError as { code?: string }).code, "ERR_TAFFY_TREE_BUSY");
  assert.deepEqual(node.getWidth(), { value: Number.NaN, unit: Yoga.UNIT_AUTO });
  assert.deepEqual(layoutSize(node), [7, 3]);
  node.free();
});

test("unmeasured calculations stay on the ordinary native path", () => {
  const fixture = fileURLToPath(new URL("./fixtures/measure-path-profile.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [fixture], { encoding: "utf8", timeout: 20_000 });
  assert.equal(result.signal, null);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    afterPlain: { ordinary: 1, measured: 0 },
    afterMeasured: { ordinary: 1, measured: 1 },
  });
});
