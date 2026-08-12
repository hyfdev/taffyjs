import { TaffyTree, type NodeId } from "@taffyjs/node";

declare const node: NodeId;
const layout = new TaffyTree().getUnroundedLayout(node);

// @ts-expect-error Layout fields are readonly.
layout.order = 1;
// @ts-expect-error Nested point fields are readonly.
layout.location.x = 1;
// @ts-expect-error Nested size fields are readonly.
layout.size.width = 1;
// @ts-expect-error Nested rect fields are readonly.
layout.padding.left = 1;

void layout;
