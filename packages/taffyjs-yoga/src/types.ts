import type { Direction, MeasureMode, Unit } from "./enums.js";
import type { legacyConstants } from "./enums.js";

export interface Layout {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Value {
  unit: Unit;
  value: number;
}

export type DirtiedFunction = (node: Node) => void;

export type MeasureFunction = (
  width: number,
  widthMode: MeasureMode,
  height: number,
  heightMode: MeasureMode,
) => Size;

export type LayoutDimension = number | "auto" | undefined;

export interface Config {
  free(): void;
}

export interface Node {
  free(): void;
  setWidth(value: number | string | undefined): void;
  setHeight(value: number | string | undefined): void;
  calculateLayout(width: LayoutDimension, height: LayoutDimension, direction?: Direction): void;
  getComputedLeft(): number;
  getComputedRight(): number;
  getComputedTop(): number;
  getComputedBottom(): number;
  getComputedWidth(): number;
  getComputedHeight(): number;
  getComputedLayout(): Layout;
}

export interface ConfigFactory {
  create(): Config;
  destroy(config: Config): void;
}

export interface NodeFactory {
  create(config?: Config): Node;
  createDefault(): Node;
  createWithConfig(config: Config): Node;
  destroy(node: Node): void;
}

export type Yoga = Readonly<
  {
    Config: ConfigFactory;
    Node: NodeFactory;
  } & typeof legacyConstants
>;
