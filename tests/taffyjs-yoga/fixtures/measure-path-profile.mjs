const testEntry = process.env.TAFFYJS_TEST_ENTRY ?? "@taffyjs/node";
const yogaTestEntry = process.env.TAFFYJS_YOGA_TEST_ENTRY ?? "yoga-layout";
const { TaffyTree } = await import(testEntry);
const { default: Yoga } = await import(yogaTestEntry);

const computeLayout = Object.getOwnPropertyDescriptor(TaffyTree.prototype, "computeLayout").value;
const setMeasure = Object.getOwnPropertyDescriptor(TaffyTree.prototype, "setMeasure").value;
const calls = { compute: 0, fallback: 0, configured: 0 };

TaffyTree.prototype.computeLayout = function (...args) {
  calls.compute += 1;
  if (args[0]?.measure !== undefined) calls.fallback += 1;
  return computeLayout.apply(this, args);
};
TaffyTree.prototype.setMeasure = function (...args) {
  calls.configured += 1;
  return setMeasure.apply(this, args);
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
  measured.unsetMeasureFunc();
  measured.calculateLayout(undefined, undefined);
  const afterUnset = { ...calls };
  measured.free();

  process.stdout.write(JSON.stringify({ afterPlain, afterMeasured, afterUnset }));
} finally {
  TaffyTree.prototype.computeLayout = computeLayout;
  TaffyTree.prototype.setMeasure = setMeasure;
}
