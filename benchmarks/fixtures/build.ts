import type { NodeId, StyleInput, TaffyTree } from "@taffyjs/node";
import type { Config, Node as YogaNode } from "@taffyjs/yoga";

import type { TaffyApi, YogaApi } from "../scenario.ts";
import {
  flatten,
  measureText,
  type LengthSpec,
  type NodeSpec,
  type TreeSpec,
} from "./tree-spec.ts";

/** Which output a scenario's consumer actually reads back. */
export type ReadPattern = "boxes" | "full-box-model";

export interface Counter {
  measureCalls: number;
}

export interface BuiltTree {
  readonly nodeCount: number;
  compute(width: number, height: number): void;
  read(pattern: ReadPattern): { checksum: number; readCount: number };
  markDirtyLeaves(fraction: number): void;
  dispose(): void;
}

/* ---------------------------------------------------------------- Taffy */

function taffyLength(api: TaffyApi, value: LengthSpec): number | object {
  if (typeof value === "number") return value;
  return api.Dimension.Percent(Number(value.slice(0, -1)));
}

function taffyStyle(api: TaffyApi, spec: NodeSpec): StyleInput {
  const s = spec.style;
  const style: Record<string, unknown> = {
    display: api.Display.Flex,
    flexDirection: s.direction === "row" ? api.FlexDirection.Row : api.FlexDirection.Column,
  };
  if (s.grow !== undefined) style.flexGrow = s.grow;
  if (s.shrink !== undefined) style.flexShrink = s.shrink;
  if (s.width !== undefined || s.height !== undefined) {
    const size: Record<string, unknown> = {};
    if (s.width !== undefined) size.width = taffyLength(api, s.width);
    if (s.height !== undefined) size.height = taffyLength(api, s.height);
    style.size = size;
  }
  if (s.minWidth !== undefined || s.minHeight !== undefined) {
    style.minSize = {
      ...(s.minWidth !== undefined && { width: s.minWidth }),
      ...(s.minHeight !== undefined && { height: s.minHeight }),
    };
  }
  if (s.padding !== undefined) style.padding = s.padding;
  if (s.border !== undefined) style.border = s.border;
  if (s.gap !== undefined) style.gap = s.gap;
  if (s.center) style.alignItems = api.AlignItems.Center;
  if (s.absolute) {
    style.position = api.Position.Absolute;
    style.inset = { top: s.top ?? 0, left: s.left ?? 0 };
  }
  if (s.grid) {
    style.display = api.Display.Grid;
    style.gridTemplateColumns = [
      api.GridTemplateComponent.Repeat(api.RepetitionCount.Count(s.grid.columns), [
        api.TrackSizingFunction.Fr(1),
      ]),
    ];
    style.gridAutoRows = [api.TrackSizingFunction.Length(s.grid.rowHeight)];
  }
  if (s.gridColumnSpan !== undefined) {
    style.gridColumn = { end: api.GridPlacement.Span(s.gridColumnSpan) };
  }
  return style as StyleInput;
}

export function buildTaffyTree(api: TaffyApi, spec: TreeSpec, counter: Counter): BuiltTree {
  const tree: TaffyTree<NodeSpec> = new api.TaffyTree<NodeSpec>();
  const order = flatten(spec);
  const ids = new Map<NodeSpec, NodeId>();
  const textNodes: NodeId[] = [];

  const measure = ({
    knownDimensions,
    availableSpace,
    context,
  }: {
    knownDimensions: { width?: number };
    availableSpace: { width: { kind: number; value?: number } };
    context?: NodeSpec;
  }) => {
    counter.measureCalls += 1;
    const atMost =
      availableSpace.width.kind === api.AvailableSpaceKind.Definite
        ? availableSpace.width.value
        : undefined;
    return measureText(context!.text!, knownDimensions.width, atMost);
  };

  const create = (node: NodeSpec): NodeId => {
    const style = taffyStyle(api, node);
    const children = (node.children ?? []).map(create);
    let id: NodeId;
    if (node.text) {
      id = tree.newLeafWithContext(node, style);
      tree.setMeasure(id, measure);
      textNodes.push(id);
    } else if (children.length > 0) {
      id = tree.newWithChildren(children, style);
    } else {
      id = tree.newLeaf(style);
    }
    ids.set(node, id);
    return id;
  };
  const root = create(spec.root);
  const nodes = order.map((node) => ids.get(node)!);

  return {
    nodeCount: nodes.length,
    compute(width, height) {
      tree.computeLayout({ root, availableSpace: { width, height } });
    },
    read(pattern) {
      let checksum = 0;
      let readCount = 0;
      for (const id of nodes) {
        const layout = tree.getLayout(id);
        checksum += layout.location.x + layout.location.y + layout.size.width + layout.size.height;
        readCount += 4;
        if (pattern === "full-box-model") {
          const { padding, border, margin } = layout;
          checksum +=
            padding.left +
            padding.right +
            padding.top +
            padding.bottom +
            border.left +
            border.right +
            border.top +
            border.bottom +
            margin.left +
            margin.right +
            margin.top +
            margin.bottom;
          readCount += 12;
        }
      }
      return { checksum, readCount };
    },
    markDirtyLeaves(fraction) {
      const count = Math.max(1, Math.round(textNodes.length * fraction));
      for (let index = 0; index < count; index += 1) tree.markDirty(textNodes[index]);
    },
    dispose() {
      tree.clear();
    },
  };
}

/* ----------------------------------------------------------------- Yoga */

function applyYogaStyle(api: YogaApi, node: YogaNode, spec: NodeSpec): void {
  const s = spec.style;
  if (s.grid || s.gridColumnSpan !== undefined) {
    throw new Error("The Yoga API cannot express a Grid fixture");
  }
  node.setFlexDirection(s.direction === "row" ? api.FlexDirection.Row : api.FlexDirection.Column);
  if (s.grow !== undefined) node.setFlexGrow(s.grow);
  if (s.shrink !== undefined) node.setFlexShrink(s.shrink);
  if (s.width !== undefined) {
    if (typeof s.width === "number") node.setWidth(s.width);
    else node.setWidthPercent(Number(s.width.slice(0, -1)));
  }
  if (s.height !== undefined) {
    if (typeof s.height === "number") node.setHeight(s.height);
    else node.setHeightPercent(Number(s.height.slice(0, -1)));
  }
  if (s.minWidth !== undefined) node.setMinWidth(s.minWidth);
  if (s.minHeight !== undefined) node.setMinHeight(s.minHeight);
  if (s.padding !== undefined) node.setPadding(api.Edge.All, s.padding);
  if (s.border !== undefined) node.setBorder(api.Edge.All, s.border);
  if (s.gap !== undefined) node.setGap(api.Gutter.All, s.gap);
  if (s.center) node.setAlignItems(api.Align.Center);
  if (s.absolute) {
    node.setPositionType(api.PositionType.Absolute);
    node.setPosition(api.Edge.Top, s.top ?? 0);
    node.setPosition(api.Edge.Left, s.left ?? 0);
  }
}

export function buildYogaTree(api: YogaApi, spec: TreeSpec, counter: Counter): BuiltTree {
  const Yoga = api.default;
  const config: Config = Yoga.Config.create();
  const order = flatten(spec);
  const ids = new Map<NodeSpec, YogaNode>();
  const textNodes: YogaNode[] = [];

  const create = (spec_: NodeSpec): YogaNode => {
    const node = Yoga.Node.createWithConfig(config);
    applyYogaStyle(api, node, spec_);
    if (spec_.text) {
      const text = spec_.text;
      node.setMeasureFunc((width, widthMode) => {
        counter.measureCalls += 1;
        const known = widthMode === api.MeasureMode.Exactly ? width : undefined;
        const atMost = widthMode === api.MeasureMode.AtMost ? width : undefined;
        return measureText(text, known, atMost);
      });
      textNodes.push(node);
    }
    for (const [index, child] of (spec_.children ?? []).entries()) {
      node.insertChild(create(child), index);
    }
    ids.set(spec_, node);
    return node;
  };
  const root = create(spec.root);
  const nodes = order.map((node) => ids.get(node)!);

  return {
    nodeCount: nodes.length,
    compute(width, height) {
      root.calculateLayout(width, height, api.Direction.LTR);
    },
    read(pattern) {
      let checksum = 0;
      let readCount = 0;
      for (const node of nodes) {
        checksum +=
          node.getComputedLeft() +
          node.getComputedTop() +
          node.getComputedWidth() +
          node.getComputedHeight();
        readCount += 4;
        if (pattern === "full-box-model") {
          checksum +=
            node.getComputedPadding(api.Edge.Left) +
            node.getComputedPadding(api.Edge.Right) +
            node.getComputedPadding(api.Edge.Top) +
            node.getComputedPadding(api.Edge.Bottom) +
            node.getComputedBorder(api.Edge.Left) +
            node.getComputedBorder(api.Edge.Right) +
            node.getComputedBorder(api.Edge.Top) +
            node.getComputedBorder(api.Edge.Bottom) +
            node.getComputedMargin(api.Edge.Left) +
            node.getComputedMargin(api.Edge.Right) +
            node.getComputedMargin(api.Edge.Top) +
            node.getComputedMargin(api.Edge.Bottom);
          readCount += 12;
        }
      }
      return { checksum, readCount };
    },
    markDirtyLeaves(fraction) {
      const count = Math.max(1, Math.round(textNodes.length * fraction));
      for (let index = 0; index < count; index += 1) textNodes[index].markDirty();
    },
    dispose() {
      root.freeRecursive();
      Yoga.Config.destroy(config);
    },
  };
}
