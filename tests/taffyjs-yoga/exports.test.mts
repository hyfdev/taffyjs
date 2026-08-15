import assert from "node:assert/strict";
import Yoga, * as implementation from "yoga-layout";
import * as implementationLoad from "yoga-layout/load";
import OracleYoga, * as oracle from "yoga-layout-oracle";
import * as oracleLoad from "yoga-layout-oracle/load";
import { test } from "vite-plus/test";

const enumNames = [
  "Align",
  "BoxSizing",
  "Dimension",
  "Direction",
  "Display",
  "Edge",
  "Errata",
  "ExperimentalFeature",
  "FlexDirection",
  "Gutter",
  "Justify",
  "LogLevel",
  "MeasureMode",
  "NodeType",
  "Overflow",
  "PositionType",
  "Unit",
  "Wrap",
] as const;

const unsupportedMembers: Partial<Record<(typeof enumNames)[number], readonly string[]>> = {
  Display: ["Contents"],
  Errata: [
    "StretchFlexBasis",
    "AbsolutePositionWithoutInsetsExcludesPadding",
    "AbsolutePercentAgainstInnerSize",
    "All",
    "Classic",
  ],
  PositionType: ["Static"],
};

const unsupportedConstants = new Set([
  "DISPLAY_CONTENTS",
  "ERRATA_STRETCH_FLEX_BASIS",
  "ERRATA_ABSOLUTE_POSITION_WITHOUT_INSETS_EXCLUDES_PADDING",
  "ERRATA_ABSOLUTE_PERCENT_AGAINST_INNER_SIZE",
  "ERRATA_ALL",
  "ERRATA_CLASSIC",
  "POSITION_TYPE_STATIC",
]);

function supportedEnum(name: (typeof enumNames)[number], value: unknown): Record<string, unknown> {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  const result = { ...(value as Record<string, unknown>) };
  for (const member of unsupportedMembers[name] ?? []) {
    const numericValue = result[member];
    delete result[member];
    if (typeof numericValue === "number") delete result[String(numericValue)];
  }
  return result;
}

test("root and load entries expose every supported Yoga 3.2.1 enum", () => {
  assert.deepEqual(Object.keys(implementation).sort(), Object.keys(oracle).sort());
  assert.deepEqual(Object.keys(implementationLoad).sort(), Object.keys(oracleLoad).sort());

  for (const name of enumNames) {
    const expected = supportedEnum(name, oracle[name]);
    assert.deepEqual(implementation[name], expected, `${name} root export`);
    assert.deepEqual(implementationLoad[name], expected, `${name} load export`);
  }
});

test("default facade exposes every supported legacy constant", () => {
  const expectedKeys = Object.keys(OracleYoga).filter((key) => !unsupportedConstants.has(key));
  assert.deepEqual(Object.keys(Yoga).sort(), expectedKeys.sort());
  for (const key of expectedKeys) {
    if (key === "Config" || key === "Node") continue;
    assert.equal(
      (Yoga as unknown as Record<string, unknown>)[key],
      (OracleYoga as unknown as Record<string, unknown>)[key],
      key,
    );
  }
});

test("facade factories preserve Yoga's documented factory methods", () => {
  assert.deepEqual(Object.keys(Yoga.Config).sort(), ["create", "destroy"]);
  assert.deepEqual(Object.keys(Yoga.Node).sort(), [
    "create",
    "createDefault",
    "createWithConfig",
    "destroy",
  ]);
});

test("handles do not expose or replace facade-native state", async () => {
  const facade = await implementationLoad.loadYoga();
  const config = facade.Config.create();
  const node = facade.Node.createWithConfig(config);
  const nodeView = node as unknown as Record<string, unknown>;
  const configView = config as unknown as Record<string, unknown>;

  assert.deepEqual(Reflect.ownKeys(node), []);
  assert.deepEqual(Reflect.ownKeys(config), []);
  assert.equal("runtime" in node, false);
  assert.equal("nodeId" in node, false);
  assert.equal("config" in node, false);
  assert.equal("state" in config, false);
  assert.equal("assertLive" in node, false);
  assert.equal("assertLive" in config, false);

  let fakeTreeUsed = false;
  nodeView.runtime = {
    tree: {
      enableRounding() {
        fakeTreeUsed = true;
      },
    },
  };
  nodeView.nodeId = 0n;
  configView.state = { useWebDefaults: true };

  node.setWidth(11);
  node.setHeight(6);
  node.calculateLayout(undefined, undefined, implementation.Direction.LTR);
  assert.equal(node.getComputedWidth(), 11);
  assert.equal(fakeTreeUsed, false);

  node.free();
  config.free();
});

test("loadYoga creates isolated facades with branded handles", async () => {
  const first = await implementationLoad.loadYoga();
  const second = await implementationLoad.loadYoga();
  const secondConfig = second.Config.create();
  const secondNode = second.Node.create();

  assert.throws(() => first.Node.createWithConfig(secondConfig), /another Yoga facade/);
  assert.throws(() => first.Config.destroy(secondConfig), /another Yoga facade/);
  assert.throws(() => first.Node.destroy(secondNode), /another Yoga facade/);

  secondNode.setWidth(12);
  secondNode.setHeight(7);
  secondNode.calculateLayout(undefined, undefined, implementation.Direction.LTR);
  assert.equal(secondNode.getComputedWidth(), 12);

  second.Node.destroy(secondNode);
  second.Config.destroy(secondConfig);
  assert.throws(() => secondNode.getComputedWidth(), /freed/);
  assert.throws(() => second.Node.createWithConfig(secondConfig), /freed/);
});
