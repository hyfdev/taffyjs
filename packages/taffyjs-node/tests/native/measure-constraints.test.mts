import assert from "node:assert/strict";
import { Display, TaffyTree, type NodeId } from "../../src/index.ts";
import { test } from "vite-plus/test";

const RAW_MASK = (1n << 64n) - 1n;
const SAFE_INTEGER = (1n << 53n) - 1n;

// Taffy's node id packs slotmap's slot version above its index, and the version advances every time
// the slot is reused, so ordinary churn walks the id past the range a double can hold exactly. The
// churn costs about a second, which is why this lives beside the binding instead of in the shared
// suite that also runs on the much slower Wasm target.
function churnPastSafeInteger(tree: TaffyTree<string>): void {
  let raw = 0n;
  let odd = false;
  while (!(raw > SAFE_INTEGER && odd)) {
    const scratch = tree.newLeaf({});
    raw = scratch & RAW_MASK;
    odd = (raw & 1n) === 1n;
    tree.remove(scratch);
  }
}

test("the measure constraint record carries a node id no double can hold", () => {
  const tree = new TaffyTree<string>();
  churnPastSafeInteger(tree);

  const measured = tree.newLeafWithContext("target", { display: Display.Flex });
  const raw = measured & RAW_MASK;
  assert.equal(raw > SAFE_INTEGER, true);
  assert.notEqual(BigInt(Number(raw)), raw);

  let seenNode: NodeId | undefined;
  let seenContext: string | undefined;
  tree.setMeasure(measured, ({ node, context }) => {
    seenNode = node;
    seenContext = context;
    return { width: 30, height: 10 };
  });
  const root = tree.newWithChildren([measured], {
    display: Display.Flex,
    size: { width: 100, height: 100 },
  });
  tree.computeLayout({ root, availableSpace: { width: 100, height: 100 } });

  assert.equal(seenNode, measured);
  assert.equal(seenContext, "target");
  assert.equal(tree.getUnroundedLayout(measured).size.width, 30);
});
