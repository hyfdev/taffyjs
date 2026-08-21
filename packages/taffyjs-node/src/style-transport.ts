import {
  GridPlacementKind,
  GridTemplateComponentKind,
  LengthUnit,
  RepetitionCountKind,
  TrackSizingKind,
} from "./numeric-families.js";

const COMMON_STYLE_BUFFER_SIZE = 1024;
const INITIAL_OVERSIZED_STYLE_BUFFER_SIZE = 64 * 1024;
const STYLE_MAGIC_0 = 0x54;
const STYLE_MAGIC_1 = 0x53;
const SCALAR_GEOMETRY = 0x80;
const POINT_FIELDS = new Set(["x", "y"]);
const SIZE_FIELDS = new Set(["width", "height"]);
const RECT_FIELDS = new Set(["left", "right", "top", "bottom"]);
const LINE_FIELDS = new Set(["start", "end"]);
const textEncoder = new TextEncoder();
const sharedStyleBuffer = new Uint8Array(COMMON_STYLE_BUFFER_SIZE);
let sharedStyleEncoder: StyleEncoder | undefined;
let sharedStyleBufferInUse = false;

function typeError(name: string, expected: string): TypeError {
  return new TypeError(`${name} must be ${expected}`);
}

function rangeError(name: string, expected: string): RangeError {
  return new RangeError(`${name} must be ${expected}`);
}

function inputObject(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw typeError(name, "an object");
  }
  return value as Record<string, unknown>;
}

function inputArray(value: unknown, name: string): readonly unknown[] {
  if (!Array.isArray(value)) throw typeError(name, "an array");
  if (value.length > 0xffff_ffff) throw rangeError(name, "no longer than 2^32 - 1");
  return value;
}

function inputNumber(value: unknown, name: string): number {
  if (typeof value !== "number") throw typeError(name, "a number");
  return value;
}

function inputString(value: unknown, name: string): string {
  if (typeof value !== "string") throw typeError(name, "a string");
  return value;
}

function inputInteger(value: unknown, minimum: number, maximum: number, name: string): number {
  const number = inputNumber(value, name);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw rangeError(name, `an integer from ${minimum} through ${maximum}`);
  }
  return number;
}

function validateFields(
  value: Record<string, unknown>,
  allowedFields: ReadonlySet<string>,
  name: string,
): void {
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) throw typeError(name, "free of unknown fields");
  }
}

function geometryObject(
  value: unknown,
  allowedFields: ReadonlySet<string>,
  name: string,
): Record<string, unknown> {
  const object = inputObject(value, name);
  validateFields(object, allowedFields, name);
  return object;
}

export function withStyleEncoder<T>(
  style: unknown,
  wireVersion: number,
  presenceBytes: number,
  use: (encoder: StyleEncoder) => T,
): T {
  inputObject(style, "Style");

  const usesSharedBuffer = !sharedStyleBufferInUse;
  if (usesSharedBuffer) sharedStyleBufferInUse = true;
  const encoder = usesSharedBuffer
    ? (sharedStyleEncoder ??= new StyleEncoder(sharedStyleBuffer))
    : new StyleEncoder(new Uint8Array(COMMON_STYLE_BUFFER_SIZE));
  encoder.reset(wireVersion, presenceBytes);
  try {
    return use(encoder);
  } finally {
    if (usesSharedBuffer) {
      encoder.releaseTemporaryStorage();
      sharedStyleBufferInUse = false;
    }
  }
}

export class StyleEncoder {
  readonly #initialBytes: Uint8Array;
  readonly #initialView: DataView;
  #bytes: Uint8Array;
  #view: DataView;
  #offset: number;
  readonly #presenceOffset = 4;

  constructor(bytes: Uint8Array) {
    this.#initialBytes = bytes;
    this.#initialView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.#bytes = bytes;
    this.#view = this.#initialView;
    this.#offset = 0;
  }

  reset(wireVersion: number, presenceBytes: number): void {
    this.releaseTemporaryStorage();
    this.#offset = this.#presenceOffset + presenceBytes;
    this.#bytes.fill(0, 0, this.#offset);
    this.#bytes[0] = STYLE_MAGIC_0;
    this.#bytes[1] = STYLE_MAGIC_1;
    this.#bytes[2] = wireVersion;
    this.#bytes[3] = presenceBytes;
  }

  releaseTemporaryStorage(): void {
    this.#bytes = this.#initialBytes;
    this.#view = this.#initialView;
  }

  field(index: number): void {
    this.#bytes[this.#presenceOffset + (index >> 3)] |= 1 << (index & 7);
  }

  finish(): Uint8Array {
    return this.#bytes.subarray(0, this.#offset);
  }

  boolean(value: unknown, name: string): void {
    if (typeof value !== "boolean") throw typeError(name, "a boolean");
    this.#u8(value ? 1 : 0);
  }

  number(value: unknown, name: string): void {
    this.#f64(inputNumber(value, name));
  }

  nullableNumber(value: unknown, name: string): void {
    if (value === null) {
      this.#u8(0);
      return;
    }
    this.#u8(1);
    this.number(value, name);
  }

  enumeration(value: unknown, mask: number, name: string): void {
    const code = inputInteger(value, 0, 30, name);
    if ((mask & (1 << code)) === 0) throw rangeError(name, "a supported enum value");
    this.#u8(code);
  }

  nullableEnumeration(value: unknown, mask: number, name: string): void {
    if (value === null) {
      this.#u8(0);
      return;
    }
    this.#u8(1);
    this.enumeration(value, mask, name);
  }

  partialPointEnumeration(value: unknown, mask: number, name: string): void {
    const object = geometryObject(value, POINT_FIELDS, name);
    const x = object.x;
    const y = object.y;
    this.#u8((x === undefined ? 0 : 1) | (y === undefined ? 0 : 2));
    if (x !== undefined) this.enumeration(x, mask, `${name}.x`);
    if (y !== undefined) this.enumeration(y, mask, `${name}.y`);
  }

  partialRectLengthPercentageAuto(value: unknown, name: string): void {
    if (this.#isLengthInput(value, name)) {
      this.#u8(SCALAR_GEOMETRY);
      this.#length(value, true, name);
      return;
    }
    const object = geometryObject(value, RECT_FIELDS, name);
    const left = object.left;
    const right = object.right;
    const top = object.top;
    const bottom = object.bottom;
    this.#u8(
      (left === undefined ? 0 : 1) |
        (right === undefined ? 0 : 2) |
        (top === undefined ? 0 : 4) |
        (bottom === undefined ? 0 : 8),
    );
    if (left !== undefined) this.#length(left, true, `${name}.left`);
    if (right !== undefined) this.#length(right, true, `${name}.right`);
    if (top !== undefined) this.#length(top, true, `${name}.top`);
    if (bottom !== undefined) this.#length(bottom, true, `${name}.bottom`);
  }

  partialSizeDimension(value: unknown, name: string): void {
    if (this.#isLengthInput(value, name)) {
      this.#u8(SCALAR_GEOMETRY);
      this.#length(value, true, name);
      return;
    }
    const object = geometryObject(value, SIZE_FIELDS, name);
    const width = object.width;
    const height = object.height;
    this.#u8((width === undefined ? 0 : 1) | (height === undefined ? 0 : 2));
    if (width !== undefined) this.#length(width, true, `${name}.width`);
    if (height !== undefined) this.#length(height, true, `${name}.height`);
  }

  partialRectLengthPercentage(value: unknown, name: string): void {
    if (this.#isLengthInput(value, name)) {
      this.#u8(SCALAR_GEOMETRY);
      this.#length(value, false, name);
      return;
    }
    const object = geometryObject(value, RECT_FIELDS, name);
    const left = object.left;
    const right = object.right;
    const top = object.top;
    const bottom = object.bottom;
    this.#u8(
      (left === undefined ? 0 : 1) |
        (right === undefined ? 0 : 2) |
        (top === undefined ? 0 : 4) |
        (bottom === undefined ? 0 : 8),
    );
    if (left !== undefined) this.#length(left, false, `${name}.left`);
    if (right !== undefined) this.#length(right, false, `${name}.right`);
    if (top !== undefined) this.#length(top, false, `${name}.top`);
    if (bottom !== undefined) this.#length(bottom, false, `${name}.bottom`);
  }

  partialSizeLengthPercentage(value: unknown, name: string): void {
    if (this.#isLengthInput(value, name)) {
      this.#u8(SCALAR_GEOMETRY);
      this.#length(value, false, name);
      return;
    }
    const object = geometryObject(value, SIZE_FIELDS, name);
    const width = object.width;
    const height = object.height;
    this.#u8((width === undefined ? 0 : 1) | (height === undefined ? 0 : 2));
    if (width !== undefined) this.#length(width, false, `${name}.width`);
    if (height !== undefined) this.#length(height, false, `${name}.height`);
  }

  dimension(value: unknown, name: string): void {
    this.#length(value, true, name);
  }

  gridTemplateComponents(value: unknown, name: string): void {
    const values = inputArray(value, name);
    this.#u32(values.length);
    for (let index = 0; index < values.length; index += 1) {
      this.#gridTemplateComponent(values[index], `${name}[${index}]`);
    }
  }

  trackSizingFunctions(value: unknown, name: string): void {
    const values = inputArray(value, name);
    this.#u32(values.length);
    for (let index = 0; index < values.length; index += 1) {
      this.#trackSizingFunction(values[index], `${name}[${index}]`);
    }
  }

  nullableGridTemplateAreas(value: unknown, name: string): void {
    if (value === null) {
      this.#u8(0);
      return;
    }
    this.#u8(1);
    const object = inputObject(value, name);
    const areas = inputArray(object.areas, `${name}.areas`);
    const rowCount = inputInteger(object.rowCount, 0, 0xffff, `${name}.rowCount`);
    const columnCount = inputInteger(object.columnCount, 0, 0xffff, `${name}.columnCount`);
    this.#u32(areas.length);
    for (let index = 0; index < areas.length; index += 1) {
      const areaName = `${name}.areas[${index}]`;
      const area = inputObject(areas[index], areaName);
      const gridName = inputString(area.name, `${areaName}.name`);
      const rowStart = inputInteger(area.rowStart, 0, 0xffff, `${areaName}.rowStart`);
      const rowEnd = inputInteger(area.rowEnd, 0, 0xffff, `${areaName}.rowEnd`);
      const columnStart = inputInteger(area.columnStart, 0, 0xffff, `${areaName}.columnStart`);
      const columnEnd = inputInteger(area.columnEnd, 0, 0xffff, `${areaName}.columnEnd`);
      this.#string(gridName, `${areaName}.name`);
      this.#u16(rowStart);
      this.#u16(rowEnd);
      this.#u16(columnStart);
      this.#u16(columnEnd);
    }
    this.#u16(rowCount);
    this.#u16(columnCount);
  }

  stringMatrix(value: unknown, name: string): void {
    this.#stringMatrix(value, name);
  }

  partialLineGridPlacement(value: unknown, name: string): void {
    const object = geometryObject(value, LINE_FIELDS, name);
    const start = object.start;
    const end = object.end;
    this.#u8((start === undefined ? 0 : 1) | (end === undefined ? 0 : 2));
    if (start !== undefined) this.#gridPlacement(start, `${name}.start`);
    if (end !== undefined) this.#gridPlacement(end, `${name}.end`);
  }

  #isLengthInput(value: unknown, name: string): boolean {
    if (typeof value === "number") return true;
    const object = inputObject(value, name);
    const unit = object.unit;
    if (unit === undefined || unit === null) return false;
    inputNumber(unit, `${name}.unit`);
    return true;
  }

  #length(value: unknown, allowAuto: boolean, name: string): void {
    if (typeof value === "number") {
      this.#u8(LengthUnit.Length);
      this.#f64(value);
      return;
    }
    const object = inputObject(value, name);
    const unit = inputInteger(object.unit, 0, 0xff, `${name}.unit`);
    if (unit !== LengthUnit.Length && unit !== LengthUnit.Percent && unit !== LengthUnit.Auto) {
      throw rangeError(`${name}.unit`, "a supported length unit");
    }
    const payload = object.value;
    if (payload !== undefined) inputNumber(payload, `${name}.value`);
    if (unit === LengthUnit.Auto) {
      if (!allowAuto) throw typeError(name, "a non-Auto length");
      this.#u8(unit);
      return;
    }
    this.#u8(unit);
    this.#f64(inputNumber(payload, `${name}.value`));
  }

  #gridPlacement(value: unknown, name: string): void {
    const object = inputObject(value, name);
    const kind = inputInteger(object.kind, 0, 0xff, `${name}.kind`);
    if (
      kind !== GridPlacementKind.Auto &&
      kind !== GridPlacementKind.Line &&
      kind !== GridPlacementKind.NamedLine &&
      kind !== GridPlacementKind.Span &&
      kind !== GridPlacementKind.NamedSpan
    ) {
      throw rangeError(`${name}.kind`, "a supported Grid placement kind");
    }
    const gridName = object.name;
    const index = object.index;
    const span = object.span;
    if (gridName !== undefined) inputString(gridName, `${name}.name`);
    if (index !== undefined) inputInteger(index, -0x8000, 0x7fff, `${name}.index`);
    if (span !== undefined) inputInteger(span, 0, 0xffff, `${name}.span`);
    this.#u8(kind);
    if (kind === GridPlacementKind.Line) {
      this.#i16(inputInteger(index, -0x8000, 0x7fff, `${name}.index`));
    } else if (kind === GridPlacementKind.NamedLine) {
      this.#string(inputString(gridName, `${name}.name`), `${name}.name`);
      this.#i16(inputInteger(index, -0x8000, 0x7fff, `${name}.index`));
    } else if (kind === GridPlacementKind.Span) {
      this.#u16(inputInteger(span, 0, 0xffff, `${name}.span`));
    } else if (kind === GridPlacementKind.NamedSpan) {
      this.#string(inputString(gridName, `${name}.name`), `${name}.name`);
      this.#u16(inputInteger(span, 0, 0xffff, `${name}.span`));
    }
  }

  #trackSizingFunction(value: unknown, name: string): void {
    const object = inputObject(value, name);
    const minimum = object.min;
    const maximum = object.max;
    if (minimum === undefined) throw typeError(`${name}.min`, "present");
    if (maximum === undefined) throw typeError(`${name}.max`, "present");
    this.#trackSizingValue(minimum, false, `${name}.min`);
    this.#trackSizingValue(maximum, true, `${name}.max`);
  }

  #trackSizingValue(value: unknown, maximum: boolean, name: string): void {
    const object = inputObject(value, name);
    const kind = inputInteger(object.kind, 0, 0xff, `${name}.kind`);
    if (
      kind !== TrackSizingKind.Length &&
      kind !== TrackSizingKind.Percent &&
      kind !== TrackSizingKind.Auto &&
      kind !== TrackSizingKind.MinContent &&
      kind !== TrackSizingKind.MaxContent &&
      kind !== TrackSizingKind.FitContent &&
      kind !== TrackSizingKind.Fr
    ) {
      throw rangeError(`${name}.kind`, "a supported track sizing kind");
    }
    const payload = object.value;
    if (!maximum && (kind === TrackSizingKind.FitContent || kind === TrackSizingKind.Fr)) {
      throw typeError(name, "a valid minimum track value");
    }
    this.#u8(kind);
    if (
      kind === TrackSizingKind.Length ||
      kind === TrackSizingKind.Percent ||
      kind === TrackSizingKind.Fr
    ) {
      this.#f64(inputNumber(payload, `${name}.value`));
    } else if (kind === TrackSizingKind.FitContent) {
      this.#length(payload, false, `${name}.value`);
    }
  }

  #gridTemplateComponent(value: unknown, name: string): void {
    const object = inputObject(value, name);
    const kind = inputInteger(object.kind, 0, 0xff, `${name}.kind`);
    if (kind !== GridTemplateComponentKind.Single && kind !== GridTemplateComponentKind.Repeat) {
      throw rangeError(`${name}.kind`, "a supported Grid template component kind");
    }
    const payload = object.value;
    if (payload === undefined) throw typeError(`${name}.value`, "present");
    this.#u8(kind);
    if (kind === GridTemplateComponentKind.Single) {
      this.#trackSizingFunction(payload, `${name}.value`);
      return;
    }
    const repetition = inputObject(payload, `${name}.value`);
    const count = repetition.count;
    const tracks = repetition.tracks;
    const lineNames = repetition.lineNames;
    if (count === undefined) throw typeError(`${name}.value.count`, "present");
    this.#repetitionCount(count, `${name}.value.count`);
    this.trackSizingFunctions(tracks, `${name}.value.tracks`);
    this.#stringMatrix(lineNames, `${name}.value.lineNames`);
  }

  #repetitionCount(value: unknown, name: string): void {
    const object = inputObject(value, name);
    const kind = inputInteger(object.kind, 0, 0xff, `${name}.kind`);
    if (
      kind !== RepetitionCountKind.Count &&
      kind !== RepetitionCountKind.AutoFill &&
      kind !== RepetitionCountKind.AutoFit
    ) {
      throw rangeError(`${name}.kind`, "a supported repetition count kind");
    }
    const payload = object.value;
    this.#u8(kind);
    if (kind === RepetitionCountKind.Count) {
      this.#u16(inputInteger(payload, 0, 0xffff, `${name}.value`));
    }
  }

  #stringMatrix(value: unknown, name: string): void {
    const rows = inputArray(value, name);
    this.#u32(rows.length);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const rowName = `${name}[${rowIndex}]`;
      const row = inputArray(rows[rowIndex], rowName);
      this.#u32(row.length);
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const valueName = `${rowName}[${columnIndex}]`;
        this.#string(inputString(row[columnIndex], valueName), valueName);
      }
    }
  }

  #ensure(additional: number): void {
    const required = this.#offset + additional;
    if (required <= this.#bytes.length) return;
    let capacity = Math.max(this.#bytes.length, INITIAL_OVERSIZED_STYLE_BUFFER_SIZE);
    while (capacity < required) {
      capacity *= 2;
      if (!Number.isSafeInteger(capacity)) throw rangeError("Style transport", "representable");
    }
    const next = new Uint8Array(capacity);
    next.set(this.#bytes.subarray(0, this.#offset));
    this.#bytes = next;
    this.#view = new DataView(next.buffer);
  }

  #u8(value: number): void {
    this.#ensure(1);
    this.#bytes[this.#offset] = value;
    this.#offset += 1;
  }

  #u16(value: number): void {
    this.#ensure(2);
    this.#view.setUint16(this.#offset, value, true);
    this.#offset += 2;
  }

  #i16(value: number): void {
    this.#ensure(2);
    this.#view.setInt16(this.#offset, value, true);
    this.#offset += 2;
  }

  #u32(value: number): void {
    this.#ensure(4);
    this.#view.setUint32(this.#offset, value, true);
    this.#offset += 4;
  }

  #f64(value: number): void {
    this.#ensure(8);
    this.#view.setFloat64(this.#offset, value, true);
    this.#offset += 8;
  }

  #string(value: string, name: string): void {
    const maximumLength = value.length * 3;
    if (!Number.isSafeInteger(maximumLength) || maximumLength > 0xffff_ffff) {
      throw rangeError(name, "at most 2^32 - 1 UTF-8 bytes");
    }
    this.#ensure(4 + maximumLength);
    const lengthOffset = this.#offset;
    this.#offset += 4;
    const result = textEncoder.encodeInto(value, this.#bytes.subarray(this.#offset));
    if (result.read !== value.length) throw rangeError(name, "valid encodable text");
    this.#view.setUint32(lengthOffset, result.written, true);
    this.#offset += result.written;
  }
}
