import { measureShape, type NodeSpec, type TreeShape, type TreeSpec } from "./tree-spec.ts";

/**
 * A deterministic application screen: chrome, a sidebar, a scrollable list of message
 * rows, a composer, and one absolutely positioned overlay. Chains of single-child
 * wrappers carry the depth.
 */

interface Scale {
  readonly rows: number;
  readonly sidebarItems: number;
  readonly chain: number;
}

const scales: Readonly<Record<number, Scale>> = {
  32: { rows: 2, sidebarItems: 1, chain: 1 },
  300: { rows: 16, sidebarItems: 4, chain: 8 },
  1200: { rows: 40, sidebarItems: 6, chain: 20 },
};

const viewport = { width: 1280, height: 800 } as const;

function chainOf(depth: number, leaf: NodeSpec): NodeSpec {
  let node = leaf;
  for (let level = 0; level < depth; level += 1) {
    node = {
      style: {
        direction: "column",
        width: "100%",
        shrink: 0,
        ...(level % 4 === 0 ? { padding: 1 } : {}),
        ...(level % 7 === 0 ? { border: 1 } : {}),
      },
      children: [node],
    };
  }
  return node;
}

function messageRow(index: number, chain: number): NodeSpec {
  const title: NodeSpec = {
    style: { shrink: 1, minWidth: 0 },
    text: { characters: 18 + ((index * 5) % 22), lineHeight: 16 },
  };
  const body: NodeSpec = {
    style: { shrink: 1, minWidth: 0 },
    text: { characters: 64 + ((index * 37) % 260), lineHeight: 18 },
  };
  const actions: NodeSpec = {
    style: { direction: "row", shrink: 0, height: 20, gap: 6 },
    children: [
      { style: { width: 42 + (index % 3) * 8, height: 20 } },
      { style: { width: 52, height: 20 } },
    ],
  };
  const column: NodeSpec = {
    style: { direction: "column", grow: 1, shrink: 1, minWidth: 0, gap: 6 },
    children: [title, body, actions],
  };
  const row: NodeSpec = {
    style: { direction: "row", shrink: 0, gap: 10, padding: 4 },
    children: [{ style: { width: 32, height: 32, shrink: 0 } }, column],
  };
  return chainOf(chain, row);
}

function sidebarItem(index: number): NodeSpec {
  return chainOf(2, {
    style: { direction: "row", shrink: 0, height: 32, gap: 6, padding: 4, center: true },
    children: [
      { style: { width: 18, height: 18, shrink: 0 } },
      {
        style: { shrink: 1, minWidth: 0 },
        text: { characters: 14 + ((index * 7) % 24), lineHeight: 16 },
      },
    ],
  });
}

export function applicationTree(size: number): TreeSpec {
  const scale = scales[size];
  if (!scale) throw new Error(`No application tree scale for ${size} nodes`);

  const header: NodeSpec = {
    style: { direction: "row", shrink: 0, height: 40, padding: 8, gap: 8, center: true },
    children: [
      { style: { width: 24, height: 24 } },
      { style: { grow: 1, shrink: 1, minWidth: 0, height: 20 } },
      { style: { width: 64, height: 24 } },
    ],
  };
  const sidebar: NodeSpec = {
    style: { direction: "column", shrink: 0, width: "20%", minWidth: 180, padding: 8, gap: 6 },
    children: Array.from({ length: scale.sidebarItems }, (_, index) => sidebarItem(index)),
  };
  const list: NodeSpec = {
    style: { direction: "column", grow: 1, shrink: 1, minHeight: 0, gap: 8 },
    children: Array.from({ length: scale.rows }, (_, index) => messageRow(index, scale.chain)),
  };
  const composer: NodeSpec = {
    style: { direction: "row", shrink: 0, height: 64, padding: 10, gap: 8, border: 1 },
    children: [
      { style: { grow: 1, shrink: 1, minWidth: 0 }, text: { characters: 26, lineHeight: 18 } },
      { style: { width: 72, height: 36, shrink: 0 } },
    ],
  };
  const main: NodeSpec = {
    style: { direction: "column", grow: 1, shrink: 1, minWidth: 0, padding: 12, gap: 10 },
    children: [list, composer],
  };
  const overlay: NodeSpec = {
    style: { absolute: true, top: 48, left: 200, width: 240, height: 120, border: 1, padding: 8 },
    children: [{ style: { grow: 1, shrink: 1, minHeight: 0 } }],
  };
  const body: NodeSpec = {
    style: { direction: "row", grow: 1, shrink: 1, minHeight: 0 },
    children: [sidebar, main],
  };
  return {
    root: {
      style: { direction: "column", width: viewport.width, height: viewport.height },
      children: [header, body, overlay],
    },
    viewport,
  };
}

export function applicationShape(size: number): TreeShape {
  return measureShape(applicationTree(size));
}
