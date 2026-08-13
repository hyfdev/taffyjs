import assert from "node:assert/strict";

import * as api from "@taffyjs/node";

const {
  AvailableSpace,
  Dimension,
  Display,
  GridTemplateComponent,
  TaffyTree,
  TrackSizingFunction,
} = api;

assert.equal(Reflect.get(api, "NativeTaffyTree"), undefined);

const availableSpace = {
  width: AvailableSpace.Definite(100),
  height: AvailableSpace.Definite(100),
};

const blockTree = new TaffyTree();
const block = blockTree.newLeaf({
  size: { width: Dimension.Length(30), height: Dimension.Length(20) },
});
blockTree.computeLayout({ root: block, availableSpace });
assert.deepEqual(blockTree.getUnroundedLayout(block).size, { width: 30, height: 20 });

const flexTree = new TaffyTree();
const flexChildren = [10, 20].map((width) =>
  flexTree.newLeaf({ size: { width: Dimension.Length(width), height: Dimension.Length(10) } }),
);
const flexRoot = flexTree.newWithChildren({ display: Display.Flex }, flexChildren);
flexTree.computeLayout({ root: flexRoot, availableSpace });
assert.equal(flexTree.getUnroundedLayout(flexChildren[1]).location.x, 10);

const gridTree = new TaffyTree();
const gridChild = gridTree.newLeaf({});
const gridRoot = gridTree.newWithChildren(
  {
    display: Display.Grid,
    gridTemplateRows: [GridTemplateComponent.Single(TrackSizingFunction.Length(25))],
    gridTemplateColumns: [GridTemplateComponent.Single(TrackSizingFunction.Length(40))],
  },
  [gridChild],
);
gridTree.computeLayout({ root: gridRoot, availableSpace });
assert.deepEqual(gridTree.getUnroundedLayout(gridChild).size, { width: 40, height: 25 });

const measureTree = new TaffyTree();
const measured = measureTree.newLeafWithContext({}, { width: 17, height: 9 });
measureTree.computeLayoutWithMeasure({
  root: measured,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
  measure({ context }) {
    assert.deepEqual(context, { width: 17, height: 9 });
    return context;
  },
});
assert.deepEqual(measureTree.getUnroundedLayout(measured).size, { width: 17, height: 9 });
