import * as api from "@taffyjs/node";
import type {
  AvailableSpaceInput,
  ChildRangeInput,
  ComputeLayoutOptions,
  ComputeLayoutWithMeasureOptions,
  DetailedLayoutInfo,
  GridPlacementInput,
  GridTemplateComponentInput,
  GridTemplateRepetitionInput,
  Layout,
  LengthInput,
  LengthPercentageInput,
  MeasureFunction,
  NodeId,
  RepetitionCountInput,
  Style,
  StyleInput,
  TrackSizingFunctionInput,
} from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Value extends true> = Value;
type RuntimeExportName =
  | "AlignContent"
  | "AlignItems"
  | "AvailableSpace"
  | "AvailableSpaceKind"
  | "BoxSizing"
  | "Clear"
  | "DetailedLayoutInfoKind"
  | "Dimension"
  | "Direction"
  | "Display"
  | "FlexDirection"
  | "FlexWrap"
  | "Float"
  | "GridAutoFlow"
  | "GridPlacement"
  | "GridPlacementKind"
  | "GridTemplateComponent"
  | "GridTemplateComponentKind"
  | "LengthUnit"
  | "Overflow"
  | "Position"
  | "RepetitionCount"
  | "RepetitionCountKind"
  | "TaffyTree"
  | "TextAlign"
  | "TrackSizingFunction"
  | "TrackSizingKind";

type DeclaredRuntimeExportName = Exclude<keyof typeof api, "phantomMarker">;
type RuntimeExportsAreExact = Assert<Equal<DeclaredRuntimeExportName, RuntimeExportName>>;

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
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void;
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
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo;
  markDirty(node: NodeId): void;
  isDirty(node: NodeId): boolean;
  computeLayout(options: ComputeLayoutOptions): void;
  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
};

type Context = { readonly label: string };
declare const actualTree: api.TaffyTree<Context>;
declare const expectedTree: ExpectedTree<Context>;
const expectedFromActual: ExpectedTree<Context> = actualTree;
const actualFromExpected: api.TaffyTree<Context> = expectedTree;
const constructorSignature: new <TContext = unknown>() => api.TaffyTree<TContext> = api.TaffyTree;

const definite: (value: number) => {
  kind: typeof api.AvailableSpaceKind.Definite;
  value: number;
} = api.AvailableSpace.Definite;
const length: (value: number) => LengthInput = api.Dimension.Length;
const line: (
  index: number,
) => Extract<GridPlacementInput, { kind: typeof api.GridPlacementKind.Line }> =
  api.GridPlacement.Line;
const track: (value: number) => TrackSizingFunctionInput = api.TrackSizingFunction.Fr;
const count: (
  value: number,
) => Extract<RepetitionCountInput, { kind: typeof api.RepetitionCountKind.Count }> =
  api.RepetitionCount.Count;
const single: (value: TrackSizingFunctionInput) => GridTemplateComponentInput =
  api.GridTemplateComponent.Single;
const repeat: (
  count: RepetitionCountInput,
  tracks: TrackSizingFunctionInput[],
  lineNames?: string[][],
) => { kind: typeof api.GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput } =
  api.GridTemplateComponent.Repeat;
const fitContent: (value: LengthPercentageInput) => TrackSizingFunctionInput =
  api.TrackSizingFunction.FitContent;
const measure: MeasureFunction<Context> = () => ({ width: 1, height: 2 });
const space: AvailableSpaceInput = api.AvailableSpace.MaxContent;

void [
  expectedFromActual,
  actualFromExpected,
  constructorSignature,
  definite,
  length,
  line,
  track,
  count,
  single,
  repeat,
  fitContent,
  measure,
  space,
];
void (0 as unknown as RuntimeExportsAreExact);
