import {
  AlignContent,
  AlignItems,
  TaffyTree,
  type MeasureArgs,
  type NodeId,
  type Style,
  type StyleInput,
} from "@taffyjs/node";

type Context = { readonly label: string };
declare const node: NodeId;
const tree = new TaffyTree<Context>();
const context: Context = { label: "measured" };
tree.newLeafWithContext({}, context);
tree.newLeafWithContext({}, undefined);
tree.setNodeContext(node, context);
tree.setNodeContext(node, undefined);
const returned: Context | undefined = tree.getNodeContext(node);

tree.computeLayoutWithMeasure({
  root: node,
  availableSpace: {
    width: { kind: 1 },
    height: { kind: 2 },
  },
  measure(args) {
    const exact: MeasureArgs<Context> = args;
    const callbackContext: Context | undefined = args.context;
    void [exact, callbackContext];
    return { width: 1, height: 2 };
  },
});

const nullable: StyleInput = {
  aspectRatio: null,
  alignItems: null,
  alignSelf: null,
  justifyItems: null,
  justifySelf: null,
  alignContent: null,
  justifyContent: null,
  gridTemplateAreas: null,
};
const explicitUndefined: StyleInput = {
  display: undefined,
  aspectRatio: undefined,
  alignItems: undefined,
  alignSelf: undefined,
  justifyItems: undefined,
  justifySelf: undefined,
  alignContent: undefined,
  justifyContent: undefined,
  gridTemplateAreas: undefined,
};
const aligned: StyleInput = {
  alignItems: AlignItems.Center,
  alignContent: AlignContent.SpaceAround,
};

declare const output: Style;
const outputAspect: number | null = output.aspectRatio;
const outputItems: AlignItems | null = output.alignItems;
const outputContent: AlignContent | null = output.alignContent;

// @ts-expect-error Context excludes null unless the generic includes it.
tree.newLeafWithContext({}, null);
// @ts-expect-error Non-nullable Style inputs reject null.
const nullDisplay: StyleInput = { display: null };
// @ts-expect-error Non-nullable numeric Style inputs reject null.
const nullGrow: StyleInput = { flexGrow: null };
// @ts-expect-error Non-nullable aggregate Style inputs reject null.
const nullPadding: StyleInput = { padding: null };
// @ts-expect-error Nullable output fields are never undefined.
const undefinedAspect: undefined = output.aspectRatio;

const nullableContextTree = new TaffyTree<Context | null>();
nullableContextTree.newLeafWithContext({}, null);

void [
  returned,
  nullable,
  explicitUndefined,
  aligned,
  outputAspect,
  outputItems,
  outputContent,
  nullDisplay,
  nullGrow,
  nullPadding,
  undefinedAspect,
];
