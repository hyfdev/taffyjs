import { Dimension, Display, TaffyTree } from "@taffyjs/wasm";

const tree = new TaffyTree();

const first = tree.newLeaf({ flexGrow: 1 });
const second = tree.newLeaf({ flexGrow: 1 });

const root = tree.newWithChildren([first, second], {
  display: Display.Flex,
  size: { width: Dimension.Percent(100), height: 20 },
});

export function computeWidthLayout(availableWidth) {
  tree.computeLayout({
    root,
    availableSpace: { width: availableWidth, height: 20 },
  });

  return {
    first: tree.getLayout(first),
    second: tree.getLayout(second),
  };
}
