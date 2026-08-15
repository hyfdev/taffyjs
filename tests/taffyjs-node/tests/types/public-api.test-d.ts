// @ts-expect-error The binding class is not a public export.
import { BindingTaffyTree } from "@taffyjs/node";
import * as api from "@taffyjs/node";
import {
  AvailableSpace,
  GridTemplateComponent,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  type ComputeLayoutWithMeasureOptions,
  type Layout,
  type NodeId,
  type Style,
  type StyleInput,
} from "@taffyjs/node";

type Context = { readonly label: string };
type ExpectedTree<TContext> = {
  enableRounding(): void;
  disableRounding(): void;
  newLeaf(style: StyleInput): NodeId;
  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId;
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;
  clear(): void;
  remove(node: NodeId): void;
  setNodeContext(node: NodeId, context: TContext | undefined): void;
  getNodeContext(node: NodeId): TContext | undefined;
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
  getStyle(node: NodeId): Style;
  getLayout(node: NodeId): Layout;
  getUnroundedLayout(node: NodeId): Layout;
  getDetailedLayoutInfo(node: NodeId): api.DetailedLayoutInfo;
  markDirty(node: NodeId): void;
  isDirty(node: NodeId): boolean;
  computeLayout(options: {
    root: NodeId;
    availableSpace: api.SizeInput<api.AvailableSpaceInput>;
  }): void;
  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
};

declare const node: NodeId;
const tree = new TaffyTree<Context>();
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
tree.setStyle(node, reusableStyleInput);
tree.newLeaf(readonlyStyleInput);

tree.computeLayoutWithMeasure({
  root: node,
  availableSpace: { width: AvailableSpace.MinContent, height: AvailableSpace.MaxContent },
  measure(args) {
    const callbackContext: Context | undefined = args.context;
    const callbackNode: NodeId = args.node;
    const callbackStyle: Style = args.style;
    void [callbackContext, callbackNode, callbackStyle];
    return { width: 1, height: 2 };
  },
});

const primitive: bigint = node;
const nodeMap = new Map<NodeId, string>([[node, "node"]]);
// @ts-expect-error Plain bigint values cannot be forged into NodeId.
const forged: NodeId = 1n;
// @ts-expect-error bigint arithmetic removes the NodeId marker.
const changed: NodeId = node + 1n;
// @ts-expect-error The public constructor takes no arguments.
new TaffyTree({});
// @ts-expect-error Context excludes null unless its generic includes null.
tree.newLeafWithContext({}, null);
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
