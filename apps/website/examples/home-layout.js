import { Dimension, Display, FlexDirection, TaffyTree } from "@taffyjs/wasm";

const tree = new TaffyTree();

const sidebar = tree.newLeaf({ size: { width: 88 } });
const header = tree.newLeaf({ size: { height: 40 } });
const content = tree.newLeaf({ flexGrow: 1 });

const main = tree.newWithChildren(
  {
    display: Display.Flex,
    flexDirection: FlexDirection.Column,
    flexGrow: 1,
    gap: { height: 12 },
  },
  [header, content],
);

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    gap: { width: 12 },
    size: { width: Dimension.Percent(100), height: 220 },
  },
  [sidebar, main],
);

export function computeHomeLayout(availableWidth) {
  tree.computeLayout({
    root,
    availableSpace: { width: availableWidth, height: 220 },
  });

  return {
    root: tree.getLayout(root),
    sidebar: tree.getLayout(sidebar),
    main: tree.getLayout(main),
    header: tree.getLayout(header),
    content: tree.getLayout(content),
  };
}
