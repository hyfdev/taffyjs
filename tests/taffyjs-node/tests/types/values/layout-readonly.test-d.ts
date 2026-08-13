import type { Layout } from "@taffyjs/node";

declare const layout: Layout;

const order: number = layout.order;
const width: number = layout.size.width;
const padding: number = layout.padding.left;

// @ts-expect-error Layout fields are readonly.
layout.order = 1;
// @ts-expect-error Nested point fields are readonly.
layout.location.x = 1;
// @ts-expect-error Nested size fields are readonly.
layout.contentSize.width = 1;
// @ts-expect-error Nested rect fields are readonly.
layout.margin.bottom = 1;

void [order, width, padding];
