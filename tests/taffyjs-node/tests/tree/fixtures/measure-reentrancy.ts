type TestModule = typeof import("@taffyjs/node");
type Operation = readonly [method: string, operation: () => unknown];
type OperationResult = { method: string; code?: unknown; message: string };

const testEntry = process.env.TAFFYJS_TEST_ENTRY ?? "@taffyjs/node";
const { AvailableSpace, TaffyTree } = (await import(testEntry)) as TestModule;

const tree = new TaffyTree();
const measured = tree.newLeafWithContext({}, { label: "measured" });
const sibling = tree.newLeaf({});
const spare = tree.newLeaf({});
const root = tree.newWithChildren({}, [measured, sibling]);
const space = { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
const operations: readonly Operation[] = [
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
    () =>
      tree.computeLayoutWithMeasure({
        root,
        availableSpace: space,
        measure: () => ({ width: 0, height: 0 }),
      }),
  ],
];

let callbackRan = false;
const results: OperationResult[] = [];
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
          const code =
            typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
          const message = error instanceof Error ? error.message : String(error);
          results.push({ method, code, message });
        }
      }
    }
    return { width: 20, height: 10 };
  },
});

process.stdout.write(`${JSON.stringify({ callbackRan, results })}\n`);
