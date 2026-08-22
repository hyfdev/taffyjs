import { CodegenError } from "../diagnostics.ts";

export type RawLayoutShape = "number" | "point" | "size" | "rect";

export interface RawLayoutField {
  readonly name: string;
  readonly shape: RawLayoutShape;
  readonly components: readonly string[];
  readonly documentation: string;
}

export interface RawLayoutCodec {
  readonly formatVersion: 1;
  readonly fields: readonly RawLayoutField[];
}

function fail(sourcePath: string, fieldPath: string, message: string): never {
  throw new CodegenError(`${sourcePath}:${fieldPath}: ${message}`);
}

function record(sourcePath: string, fieldPath: string, value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail(sourcePath, fieldPath, "expected an object");
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  sourcePath: string,
  fieldPath: string,
  value: Record<string, unknown>,
  required: readonly string[],
): void {
  const expected = new Set(required);
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) fail(sourcePath, `${fieldPath}.${key}`, "unknown property");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) fail(sourcePath, `${fieldPath}.${key}`, "missing property");
  }
}

function string(sourcePath: string, fieldPath: string, value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return fail(sourcePath, fieldPath, "expected a non-empty string");
  }
  return value;
}

function documentation(sourcePath: string, fieldPath: string, value: unknown): string {
  const text = string(sourcePath, fieldPath, value);
  if (text.includes("\n") || text.includes("\r") || text.includes("*/")) {
    return fail(sourcePath, fieldPath, "expected single-line comment text");
  }
  return text;
}

function array(sourcePath: string, fieldPath: string, value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) return fail(sourcePath, fieldPath, "expected an array");
  if (value.length === 0) return fail(sourcePath, fieldPath, "must not be empty");
  return value;
}

function shape(sourcePath: string, fieldPath: string, value: unknown): RawLayoutShape {
  if (value === "number" || value === "point" || value === "size" || value === "rect") {
    return value;
  }
  return fail(sourcePath, fieldPath, 'expected "number", "point", "size", or "rect"');
}

function field(sourcePath: string, fieldPath: string, value: unknown): RawLayoutField {
  const input = record(sourcePath, fieldPath, value);
  const fieldShape = shape(sourcePath, `${fieldPath}.shape`, input.shape);
  const required =
    fieldShape === "number"
      ? ["name", "shape", "documentation"]
      : ["name", "shape", "components", "documentation"];
  exactKeys(sourcePath, fieldPath, input, required);
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    shape: fieldShape,
    components:
      fieldShape === "number"
        ? []
        : array(sourcePath, `${fieldPath}.components`, input.components).map((item, index) =>
            string(sourcePath, `${fieldPath}.components[${index}]`, item),
          ),
    documentation: documentation(sourcePath, `${fieldPath}.documentation`, input.documentation),
  };
}

export function validateLayoutCodec(value: unknown, sourcePath: string): RawLayoutCodec {
  const input = record(sourcePath, "$", value);
  exactKeys(sourcePath, "$", input, ["$schema", "formatVersion", "fields"]);
  if (input.$schema !== "./schemas/layout-codec.schema.json") {
    fail(sourcePath, "$.$schema", 'expected "./schemas/layout-codec.schema.json"');
  }
  if (input.formatVersion !== 1) fail(sourcePath, "$.formatVersion", "unsupported format version");
  return {
    formatVersion: 1,
    fields: array(sourcePath, "$.fields", input.fields).map((item, index) =>
      field(sourcePath, `$.fields[${index}]`, item),
    ),
  };
}
