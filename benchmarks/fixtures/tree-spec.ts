/** One API-neutral description of a fixture tree, built natively by each public API. */

export type LengthSpec = number | `${number}%`;

export interface StyleSpec {
  readonly direction?: "row" | "column";
  readonly grow?: number;
  readonly shrink?: number;
  readonly width?: LengthSpec;
  readonly height?: LengthSpec;
  readonly minWidth?: number;
  readonly minHeight?: number;
  readonly padding?: number;
  readonly border?: number;
  readonly gap?: number;
  readonly absolute?: boolean;
  readonly top?: number;
  readonly left?: number;
  readonly center?: boolean;
  /** Turns this node into a Grid container with an even fr column template. */
  readonly grid?: { readonly columns: number; readonly rowHeight: number };
  /** Places this node across that many Grid columns. */
  readonly gridColumnSpan?: number;
}

export interface TextSpec {
  readonly characters: number;
  readonly lineHeight: number;
}

export interface NodeSpec {
  readonly style: StyleSpec;
  readonly text?: TextSpec;
  readonly children?: readonly NodeSpec[];
}

export interface TreeSpec {
  readonly root: NodeSpec;
  readonly viewport: { readonly width: number; readonly height: number };
}

export interface TreeShape {
  readonly nodeCount: number;
  readonly textCount: number;
  readonly maxDepth: number;
  readonly meanLeafDepth: number;
}

export function measureShape(spec: TreeSpec): TreeShape {
  let nodeCount = 0;
  let leafCount = 0;
  let textCount = 0;
  let maxDepth = 0;
  let leafDepthTotal = 0;
  const walk = (node: NodeSpec, depth: number): void => {
    nodeCount += 1;
    maxDepth = Math.max(maxDepth, depth);
    if (node.text) textCount += 1;
    const children = node.children ?? [];
    if (children.length === 0) {
      leafCount += 1;
      leafDepthTotal += depth;
    }
    for (const child of children) walk(child, depth + 1);
  };
  walk(spec.root, 0);
  return {
    nodeCount,
    textCount,
    maxDepth,
    meanLeafDepth: Number((leafDepthTotal / leafCount).toFixed(1)),
  };
}

/** Flattens the tree in the order both builders attach nodes, so reads line up. */
export function flatten(spec: TreeSpec): readonly NodeSpec[] {
  const nodes: NodeSpec[] = [];
  const walk = (node: NodeSpec): void => {
    nodes.push(node);
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec.root);
  return nodes;
}

/** The one text-measurement function every implementation calls: character advance and greedy wrapping. */
export function measureText(
  text: TextSpec,
  knownWidth: number | undefined,
  atMostWidth: number | undefined,
): { readonly width: number; readonly height: number } {
  const advance = 7;
  const naturalWidth = Math.max(advance, text.characters * advance);
  const constraint = knownWidth ?? atMostWidth;
  const width =
    constraint === undefined ? naturalWidth : Math.max(advance, Math.min(naturalWidth, constraint));
  const lines = Math.max(1, Math.ceil(naturalWidth / width));
  return { width, height: lines * text.lineHeight };
}

/** Replaces every text node with a leaf of the size its callback returns at natural width, leaving node count and shape unchanged. */
export function freezeText(spec: TreeSpec): TreeSpec {
  const convert = (node: NodeSpec): NodeSpec => {
    const children = node.children?.map(convert);
    if (!node.text) return children ? { ...node, children } : node;
    const size = measureText(node.text, undefined, undefined);
    const { text: _text, ...rest } = node;
    return { ...rest, style: { ...node.style, width: size.width, height: size.height } };
  };
  return { ...spec, root: convert(spec.root) };
}
