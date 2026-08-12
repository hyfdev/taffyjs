import type {
  Line,
  LineInput,
  Point,
  PointInput,
  Rect,
  RectInput,
  Size,
  SizeInput,
} from "@taffyjs/node";

declare const point: Point<number>;
declare const size: Size<number>;
declare const rect: Rect<number>;
declare const line: Line<number>;

// @ts-expect-error Outputs are readonly.
point.x = 1;
// @ts-expect-error Outputs are readonly.
size.width = 1;
// @ts-expect-error Outputs are readonly.
rect.left = 1;
// @ts-expect-error Outputs are readonly.
line.start = 1;

const pointInput: PointInput<number> = { x: 1, y: 2 };
const sizeInput: SizeInput<number> = { width: 1, height: 2 };
const rectInput: RectInput<number> = { left: 1, right: 2, top: 3, bottom: 4 };
const lineInput: LineInput<number> = { start: 1, end: 2 };
pointInput.x = 3;
sizeInput.width = 3;
rectInput.left = 3;
lineInput.start = 3;
