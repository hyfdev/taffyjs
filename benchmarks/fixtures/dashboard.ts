import type { NodeSpec, TreeSpec } from "./tree-spec.ts";

/**
 * One dashboard laid out twice: as a twelve-column CSS Grid, and as the nested
 * flex rows and columns a Yoga user writes to reach the same picture. Card contents
 * are identical, so the pair isolates what the grid algorithm costs against the
 * emulation it replaces.
 */

const cardCount = 24;
const viewport = { width: 1440, height: 900 } as const;
const spans = [3, 3, 3, 3, 4, 4, 4, 6, 6, 12] as const;

function card(index: number): readonly NodeSpec[] {
  return [
    {
      style: { direction: "row", shrink: 0, height: 24, gap: 8, center: true },
      children: [
        { style: { width: 16, height: 16, shrink: 0 } },
        { style: { grow: 1, shrink: 1, minWidth: 0, height: 14 } },
      ],
    },
    { style: { grow: 1, shrink: 1, minHeight: 0, minWidth: 0 } },
    {
      style: { direction: "row", shrink: 0, height: 18, gap: 6 },
      children: [
        { style: { width: 40 + (index % 4) * 6, height: 18 } },
        { style: { grow: 1, shrink: 1, minWidth: 0, height: 18 } },
      ],
    },
  ];
}

function spanOf(index: number): number {
  return spans[index % spans.length];
}

/** The grid form: one grid container, items placed by column span. */
export function dashboardGrid(): TreeSpec {
  return {
    root: {
      style: {
        direction: "row",
        width: viewport.width,
        height: viewport.height,
        padding: 16,
        gap: 12,
        grid: { columns: 12, rowHeight: 160 },
      },
      children: Array.from({ length: cardCount }, (_, index) => ({
        style: {
          direction: "column",
          padding: 10,
          border: 1,
          gap: 8,
          minHeight: 0,
          gridColumnSpan: spanOf(index),
        },
        children: card(index),
      })),
    },
    viewport,
  };
}

/** The flex emulation: rows of percentage-width columns adding up to twelve. */
export function dashboardFlex(): TreeSpec {
  const rows: NodeSpec[] = [];
  let row: NodeSpec[] = [];
  let used = 0;
  const flushRow = (): void => {
    if (row.length === 0) return;
    rows.push({
      style: { direction: "row", shrink: 0, height: 160, gap: 12 },
      children: row,
    });
    row = [];
    used = 0;
  };
  for (let index = 0; index < cardCount; index += 1) {
    const span = spanOf(index);
    if (used + span > 12) flushRow();
    row.push({
      style: {
        direction: "column",
        width: `${Number(((span / 12) * 100).toFixed(4))}%`,
        padding: 10,
        border: 1,
        gap: 8,
        minHeight: 0,
        shrink: 1,
      },
      children: card(index),
    });
    used += span;
  }
  flushRow();
  return {
    root: {
      style: {
        direction: "column",
        width: viewport.width,
        height: viewport.height,
        padding: 16,
        gap: 12,
      },
      children: rows,
    },
    viewport,
  };
}
