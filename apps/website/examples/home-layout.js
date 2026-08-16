import { Dimension, Display, FlexDirection, TaffyTree } from "@taffyjs/wasm";

export function computeHomeLayout({
  availableWidth,
  sidebarWidth,
  headerHeight,
  horizontalGap,
  verticalGap,
}) {
  const tree = new TaffyTree();

  const sidebar = tree.newLeaf({ size: { width: sidebarWidth } });
  const header = tree.newLeaf({ size: { height: headerHeight } });
  const content = tree.newLeaf({ flexGrow: 1 });

  const main = tree.newWithChildren(
    {
      display: Display.Flex,
      flexDirection: FlexDirection.Column,
      flexGrow: 1,
      gap: { height: verticalGap },
    },
    [header, content],
  );

  const root = tree.newWithChildren(
    {
      display: Display.Flex,
      gap: { width: horizontalGap },
      size: { width: Dimension.Percent(100), height: 220 },
    },
    [sidebar, main],
  );

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
