import assert from "node:assert/strict";
import Yoga, { Align, ExperimentalFeature, FlexDirection } from "yoga-layout";
import OracleYoga, {
  Align as OracleAlign,
  ExperimentalFeature as OracleExperimentalFeature,
  FlexDirection as OracleFlexDirection,
} from "yoga-layout-oracle";
import { test } from "vite-plus/test";

test("Config exposes the classified Yoga 3.2.1 state API", () => {
  const config = Yoga.Config.create();
  const oracle = OracleYoga.Config.create();
  try {
    assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(config)).sort(), [
      "constructor",
      "free",
      "getErrata",
      "isExperimentalFeatureEnabled",
      "setErrata",
      "setExperimentalFeatureEnabled",
      "setPointScaleFactor",
      "setUseWebDefaults",
      "useWebDefaults",
    ]);

    assert.equal(config.useWebDefaults(), oracle.useWebDefaults());
    assert.equal(config.getErrata(), oracle.getErrata());
    assert.equal(
      config.isExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis),
      oracle.isExperimentalFeatureEnabled(OracleExperimentalFeature.WebFlexBasis),
    );

    config.setUseWebDefaults(true);
    oracle.setUseWebDefaults(true);
    config.setExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis, true);
    oracle.setExperimentalFeatureEnabled(OracleExperimentalFeature.WebFlexBasis, true);
    config.setPointScaleFactor(0.5);
    oracle.setPointScaleFactor(0.5);

    assert.equal(config.useWebDefaults(), oracle.useWebDefaults());
    assert.equal(
      config.isExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis),
      oracle.isExperimentalFeatureEnabled(OracleExperimentalFeature.WebFlexBasis),
    );
  } finally {
    config.free();
    oracle.free();
  }
});

test("useWebDefaults materializes construction defaults and leaves live defaults live", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  const legacyNode = Yoga.Node.createWithConfig(config);
  const oracleLegacyNode = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    assert.equal(legacyNode.getAlignContent(), Align.FlexStart);
    assert.equal(legacyNode.getFlexDirection(), FlexDirection.Column);
    assert.equal(legacyNode.getFlexShrink(), 0);

    config.setUseWebDefaults(true);
    oracleConfig.setUseWebDefaults(true);
    assert.equal(legacyNode.getAlignContent(), oracleLegacyNode.getAlignContent());
    assert.equal(legacyNode.getFlexDirection(), oracleLegacyNode.getFlexDirection());
    assert.equal(legacyNode.getFlexShrink(), oracleLegacyNode.getFlexShrink());

    const webNode = Yoga.Node.createWithConfig(config);
    const oracleWebNode = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      assert.equal(webNode.getAlignContent(), Align.Stretch);
      assert.equal(webNode.getAlignContent(), OracleAlign.Stretch);
      assert.equal(webNode.getFlexDirection(), FlexDirection.Row);
      assert.equal(webNode.getFlexDirection(), OracleFlexDirection.Row);
      assert.equal(webNode.getFlexShrink(), 1);
      assert.equal(webNode.getFlexShrink(), oracleWebNode.getFlexShrink());
    } finally {
      webNode.free();
      oracleWebNode.free();
    }
  } finally {
    legacyNode.free();
    oracleLegacyNode.free();
    config.free();
    oracleConfig.free();
  }
});

test("Nodes retain Config state after the public Config handle is freed", () => {
  const config = Yoga.Config.create();
  config.setUseWebDefaults(true);
  const node = Yoga.Node.createWithConfig(config);

  config.free();
  assert.throws(() => config.useWebDefaults(), /freed/);
  assert.throws(() => Yoga.Node.createWithConfig(config), /freed/);

  assert.equal(node.getFlexShrink(), 1);
  node.setWidth(12);
  node.setHeight(7);
  node.calculateLayout(undefined, undefined);
  assert.equal(node.getComputedWidth(), 12);
  node.free();
});

test("Config rejects unsupported or malformed dynamic values before mutation", () => {
  const config = Yoga.Config.create();
  try {
    const originalWebDefaults = config.useWebDefaults();
    const originalExperiment = config.isExperimentalFeatureEnabled(
      ExperimentalFeature.WebFlexBasis,
    );

    assert.throws(() => config.setUseWebDefaults(1 as never), TypeError);
    assert.equal(config.useWebDefaults(), originalWebDefaults);

    assert.throws(
      () => config.setExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis, 1 as never),
      TypeError,
    );
    assert.equal(
      config.isExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis),
      originalExperiment,
    );

    assert.throws(() => config.setExperimentalFeatureEnabled(99 as never, true), TypeError);
    assert.throws(() => config.isExperimentalFeatureEnabled(99 as never), TypeError);
    assert.throws(() => config.setErrata(1 as never), TypeError);
    assert.equal(config.getErrata(), Yoga.ERRATA_NONE);
    assert.throws(() => config.setPointScaleFactor(-1), TypeError);
    assert.throws(() => config.setPointScaleFactor(Number.NaN), TypeError);
    config.setPointScaleFactor(Number.POSITIVE_INFINITY);
  } finally {
    config.free();
  }
});
