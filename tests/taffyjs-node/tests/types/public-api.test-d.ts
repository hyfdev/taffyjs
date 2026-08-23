// @ts-expect-error The binding class is not a public export.
import { BindingTaffyTree } from "@taffyjs/node";
// @ts-expect-error The measured layout options were folded into ComputeLayoutOptions.
import type { ComputeLayoutWithMeasureOptions } from "@taffyjs/node";
import * as api from "@taffyjs/node";
import {
  AvailableSpace,
  GridTemplateComponent,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  type ComputeLayoutOptions,
  type Layout,
  type NodeId,
  type Style,
  type StyleInput,
  type StyleUpdate,
} from "@taffyjs/node";

type Context = { readonly label: string };
type ExpectedTree<TContext> = {
  enableRounding(): void;
  disableRounding(): void;
  newLeaf(style?: StyleInput): NodeId;
  newLeafWithContext(context: TContext | undefined, style?: StyleInput): NodeId;
  newWithChildren(children: readonly NodeId[], style?: StyleInput): NodeId;
  clear(): void;
  remove(node: NodeId): void;
  setNodeContext(node: NodeId, context: TContext | undefined): void;
  getNodeContext(node: NodeId): TContext | undefined;
  setMeasure(node: NodeId, measure: api.MeasureFunction<TContext> | undefined): void;
  addChild(parent: NodeId, child: NodeId): void;
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void;
  setChildren(parent: NodeId, children: readonly NodeId[]): void;
  removeChild(parent: NodeId, child: NodeId): void;
  removeChildAtIndex(parent: NodeId, index: number): NodeId;
  removeChildrenRange(parent: NodeId, range: { start: number; end: number }): void;
  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId;
  getChildAtIndex(parent: NodeId, index: number): NodeId;
  getChildCount(parent: NodeId): number;
  getNodeCount(): number;
  getParent(node: NodeId): NodeId | null;
  getChildren(parent: NodeId): readonly NodeId[];
  setStyle(node: NodeId, style: StyleInput): void;
  updateStyle(node: NodeId, update: StyleUpdate): void;
  getStyle(node: NodeId): Style;
  getLayout(node: NodeId): Layout;
  getUnroundedLayout(node: NodeId): Layout;
  getDetailedLayoutInfo(node: NodeId): api.DetailedLayoutInfo;
  markDirty(node: NodeId): void;
  isDirty(node: NodeId): boolean;
  computeLayout(options: ComputeLayoutOptions<TContext>): void;
};

declare const node: NodeId;
const tree = new TaffyTree<Context>();
declare const removedOptions: ComputeLayoutWithMeasureOptions;
void removedOptions;
const expectedFromActual: ExpectedTree<Context> = tree;
const constructor: new <TContext = unknown>() => TaffyTree<TContext> = TaffyTree;
const prototype: TaffyTree<Context> = TaffyTree.prototype;
const context: Context | undefined = tree.getNodeContext(node);
const parent: NodeId | null = tree.getParent(node);
const children: readonly NodeId[] = tree.getChildren(node);
const readonlyTracks = [TrackSizingFunction.Auto] as const;
const readonlyLineNames = [["line"]] as const;
const readonlyComponents = [
  GridTemplateComponent.Repeat(RepetitionCount.Count(1), readonlyTracks, readonlyLineNames),
] as const;
const readonlyAreas = [
  { name: "area", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 },
] as const;
const readonlyStyleInput: StyleInput = {
  gridTemplateRows: readonlyComponents,
  gridTemplateColumns: readonlyComponents,
  gridAutoRows: readonlyTracks,
  gridAutoColumns: readonlyTracks,
  gridTemplateAreas: { areas: readonlyAreas, rowCount: 1, columnCount: 1 },
  gridTemplateColumnNames: readonlyLineNames,
  gridTemplateRowNames: readonlyLineNames,
};
const reusableStyleInput: StyleInput = tree.getStyle(node);
const readonlyStyleUpdate: StyleUpdate = {
  size: { width: 10 },
  gridAutoRows: readonlyTracks,
};
tree.setStyle(node, reusableStyleInput);
tree.updateStyle(node, readonlyStyleUpdate);
tree.newLeaf();
tree.newLeaf(undefined);
tree.newLeaf(readonlyStyleInput);
tree.newLeafWithContext({ label: "context" });
tree.newLeafWithContext({ label: "styled context" }, readonlyStyleInput);
tree.newLeafWithContext(undefined, undefined);
tree.newWithChildren([]);
tree.newWithChildren([], readonlyStyleInput);
tree.newWithChildren([], undefined);

const perNodeMeasure: api.MeasureFunction<Context> = ({ context: callbackContext }) => {
  const label: string | undefined = callbackContext?.label;
  void label;
  return { width: 1, height: 2 };
};
tree.setMeasure(node, perNodeMeasure);
tree.setMeasure(node, undefined);
// @ts-expect-error null does not clear a per-node measure.
tree.setMeasure(node, null);

tree.computeLayout({
  root: node,
  availableSpace: { width: AvailableSpace.MinContent, height: AvailableSpace.MaxContent },
  measure(args) {
    const callbackContext: Context | undefined = args.context;
    const callbackNode: NodeId = args.node;
    const callbackStyle: Style = args.getStyle();
    const getStyle: () => Style = args.getStyle;
    // @ts-expect-error MeasureArgs no longer eagerly contains Style.
    void args.style;
    void [callbackContext, callbackNode, callbackStyle, getStyle];
    return { width: 1, height: 2 };
  },
});
// @ts-expect-error The public measured-layout method was folded into computeLayout.
void tree.computeLayoutWithMeasure;

const primitive: bigint = node;
const nodeMap = new Map<NodeId, string>([[node, "node"]]);
// @ts-expect-error Plain bigint values do not satisfy the branded NodeId type.
const forged: NodeId = 1n;
// @ts-expect-error bigint arithmetic removes the NodeId marker.
const changed: NodeId = node + 1n;
// @ts-expect-error The public constructor takes no arguments.
new TaffyTree({});
// @ts-expect-error Context excludes null unless its generic includes null.
tree.newLeafWithContext(null);
// @ts-expect-error The former style-first context order is not retained.
tree.newLeafWithContext({}, { label: "old order" });
// @ts-expect-error The former style-first children order is not retained.
tree.newWithChildren({}, [node]);
// @ts-expect-error Returned children are readonly.
children.push(node);
// @ts-expect-error Raw native methods are private.
tree.rawComputeLayout(node, {});
// @ts-expect-error The constructor prototype retains the public instance type.
void TaffyTree.prototype.notARealMember;
// @ts-expect-error NodeId has no public parser.
api.parseNodeId(node);

type PrivateRuntimeName = Extract<
  keyof typeof api,
  "BindingTaffyTree" | "parseNodeId" | "serializeNodeId" | "rawComputeLayout"
>;
type AssertNever<Value extends never> = Value;
type NoPrivateRuntimeName = AssertNever<PrivateRuntimeName>;

void [
  BindingTaffyTree,
  expectedFromActual,
  constructor,
  prototype,
  context,
  parent,
  primitive,
  nodeMap,
  forged,
  changed,
];
void (0 as unknown as NoPrivateRuntimeName);
