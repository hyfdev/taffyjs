import { AvailableSpace, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
const measured = tree.newLeafWithContext({}, { label: "measured" });
const sibling = tree.newLeaf({});
const spare = tree.newLeaf({});
const root = tree.newWithChildren({}, [measured, sibling]);
const space = { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
const operations = [
  ["enableRounding", () => tree.enableRounding()],
  ["disableRounding", () => tree.disableRounding()],
  ["newLeaf", () => tree.newLeaf({})],
  ["newLeafWithContext", () => tree.newLeafWithContext({}, true)],
  ["newWithChildren", () => tree.newWithChildren({}, [spare])],
  ["clear", () => tree.clear()],
  ["remove", () => tree.remove(measured)],
  ["setNodeContext", () => tree.setNodeContext(measured, true)],
  ["addChild", () => tree.addChild(root, spare)],
  ["insertChildAtIndex", () => tree.insertChildAtIndex(root, 0, spare)],
  ["setChildren", () => tree.setChildren(root, [measured, sibling])],
  ["removeChild", () => tree.removeChild(root, measured)],
  ["removeChildAtIndex", () => tree.removeChildAtIndex(root, 0)],
  ["removeChildrenRange", () => tree.removeChildrenRange(root, { start: 0, end: 1 })],
  ["replaceChildAtIndex", () => tree.replaceChildAtIndex(root, 0, spare)],
  ["getChildAtIndex", () => tree.getChildAtIndex(root, 0)],
  ["getChildCount", () => tree.getChildCount(root)],
  ["getNodeCount", () => tree.getNodeCount()],
  ["getParent", () => tree.getParent(measured)],
  ["getChildren", () => tree.getChildren(root)],
  ["setStyle", () => tree.setStyle(measured, {})],
  ["getStyle", () => tree.getStyle(measured)],
  ["getLayout", () => tree.getLayout(measured)],
  ["getUnroundedLayout", () => tree.getUnroundedLayout(measured)],
  ["getDetailedLayoutInfo", () => tree.getDetailedLayoutInfo(measured)],
  ["markDirty", () => tree.markDirty(measured)],
  ["isDirty", () => tree.isDirty(measured)],
  ["computeLayout", () => tree.computeLayout({ root, availableSpace: space })],
  [
    "computeLayoutWithMeasure",
    () => tree.computeLayoutWithMeasure({ root, availableSpace: space, measure: () => ({}) }),
  ],
];

let callbackRan = false;
const results = [];
tree.computeLayoutWithMeasure({
  root,
  availableSpace: space,
  measure() {
    if (!callbackRan) {
      callbackRan = true;
      for (const [method, operation] of operations) {
        try {
          operation();
          results.push({ method, message: "did not throw" });
        } catch (error) {
          results.push({ method, code: error.code, message: error.message });
        }
      }
    }
    return { width: 20, height: 10 };
  },
});

process.stdout.write(`${JSON.stringify({ callbackRan, results })}\n`);
