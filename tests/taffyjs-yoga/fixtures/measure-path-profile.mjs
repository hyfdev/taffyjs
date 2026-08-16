const testEntry = process.env.TAFFYJS_TEST_ENTRY ?? "@taffyjs/node";
const yogaTestEntry = process.env.TAFFYJS_YOGA_TEST_ENTRY ?? "yoga-layout";
const { TaffyTree } = await import(testEntry);
const { default: Yoga } = await import(yogaTestEntry);

const ordinaryCompute = Object.getOwnPropertyDescriptor(TaffyTree.prototype, "computeLayout").value;
const measuredCompute = Object.getOwnPropertyDescriptor(
  TaffyTree.prototype,
  "computeLayoutWithMeasure",
).value;
const calls = { ordinary: 0, measured: 0 };

TaffyTree.prototype.computeLayout = function (...args) {
  calls.ordinary += 1;
  return ordinaryCompute.apply(this, args);
};
TaffyTree.prototype.computeLayoutWithMeasure = function (...args) {
  calls.measured += 1;
  return measuredCompute.apply(this, args);
};

try {
  const plain = Yoga.Node.create();
  plain.calculateLayout(undefined, undefined);
  const afterPlain = { ...calls };
  plain.free();

  const measured = Yoga.Node.create();
  measured.setMeasureFunc(() => ({ width: 8, height: 4 }));
  measured.calculateLayout(undefined, undefined);
  const afterMeasured = { ...calls };
  measured.free();

  process.stdout.write(JSON.stringify({ afterPlain, afterMeasured }));
} finally {
  TaffyTree.prototype.computeLayout = ordinaryCompute;
  TaffyTree.prototype.computeLayoutWithMeasure = measuredCompute;
}
