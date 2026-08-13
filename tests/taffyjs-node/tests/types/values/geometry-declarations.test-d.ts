import type {
  LineInput,
  PartialLineInput,
  PartialPointInput,
  PartialRectInput,
  PartialSizeInput,
  PointInput,
  RectInput,
  SizeInput,
} from "@taffyjs/node";

const point: PointInput<number> = { x: 1, y: 2 };
const size: SizeInput<number> = { width: 1, height: 2 };
const rect: RectInput<number> = { left: 1, right: 2, top: 3, bottom: 4 };
const line: LineInput<number> = { start: 1, end: 2 };
void [point, size, rect, line];

// @ts-expect-error Complete Point input requires y.
const incompletePoint: PointInput<number> = { x: 1 };
// @ts-expect-error Complete Size input requires height.
const incompleteSize: SizeInput<number> = { width: 1 };
// @ts-expect-error Complete Rect input requires bottom.
const incompleteRect: RectInput<number> = { left: 1, right: 2, top: 3 };
// @ts-expect-error Complete Line input requires end.
const incompleteLine: LineInput<number> = { start: 1 };
void [incompletePoint, incompleteSize, incompleteRect, incompleteLine];

const partialPoint: PartialPointInput<number> = { x: undefined };
const partialSize: PartialSizeInput<number> = { height: 2 };
const partialRect: PartialRectInput<number> = {};
const partialLine: PartialLineInput<number> = { start: 1, end: undefined };
partialPoint.y = 2;
partialSize.width = undefined;
partialRect.bottom = 4;
partialLine.start = undefined;
