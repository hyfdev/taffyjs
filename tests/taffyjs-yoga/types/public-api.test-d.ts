import Yoga, {
  Direction,
  Display,
  Errata,
  PositionType,
  type Config,
  type DirtiedFunction,
  type MeasureFunction,
  type Node,
} from "yoga-layout";
import {
  loadYoga,
  type Yoga as LoadedYoga,
  type Config as LoadedConfig,
  type Node as LoadedNode,
} from "yoga-layout/load";

const config: Config = Yoga.Config.create();
const node: Node = Yoga.Node.create(config);
node.setWidth(100);
node.setHeight(40);
node.calculateLayout(undefined, undefined, Direction.LTR);
const width: number = node.getComputedWidth();
const dirtied: DirtiedFunction = (dirtyNode) => dirtyNode.getComputedWidth();
const measure: MeasureFunction = () => ({ width: 1, height: 2 });
const loadedPromise: Promise<LoadedYoga> = loadYoga();
const loadedConfig: LoadedConfig = config;
const loadedNode: LoadedNode = node;

// @ts-expect-error Display.Contents is unsupported and omitted.
void Display.Contents;
// @ts-expect-error PositionType.Static is unsupported and omitted.
void PositionType.Static;
// @ts-expect-error Non-None Errata values are unsupported and omitted.
void Errata.Classic;
// @ts-expect-error The eager root does not export Yoga as a named type.
type RootYoga = import("yoga-layout").Yoga;

void [
  width,
  dirtied,
  measure,
  loadedPromise,
  loadedConfig,
  loadedNode,
  Display.Flex,
  PositionType.Relative,
  Errata.None,
  0 as unknown as RootYoga,
];
