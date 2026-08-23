import { CodegenError } from "../diagnostics.ts";

export const styleEncodingCategories = [
  "boolean",
  "number",
  "nullable-number",
  "enum",
  "nullable-enum",
  "partial-point-enum",
  "partial-rect-length-percentage-auto",
  "partial-size-dimension",
  "partial-size-length-percentage-auto",
  "partial-rect-length-percentage",
  "partial-size-length-percentage",
  "unsigned-16",
  "dimension",
  "grid-template-component-array",
  "track-sizing-array",
  "nullable-grid-template-areas",
  "string-matrix",
  "partial-line-grid-placement",
] as const;

export type StyleEncodingCategory = (typeof styleEncodingCategories)[number];

export interface RawStyleField {
  readonly name: string;
  readonly category: StyleEncodingCategory;
  readonly description: string;
  readonly numericFamily?: string;
}

export interface RawStyleCodec {
  readonly formatVersion: 1;
  readonly wireVersion: number;
  readonly fields: readonly RawStyleField[];
}

const enumCategories = new Set<StyleEncodingCategory>([
  "enum",
  "nullable-enum",
  "partial-point-enum",
]);

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
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(sourcePath, `${fieldPath}.${key}`, "unknown property");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) fail(sourcePath, `${fieldPath}.${key}`, "missing property");
  }
}

function string(sourcePath: string, fieldPath: string, value: unknown): string {
  if (typeof value !== "string") return fail(sourcePath, fieldPath, "expected a string");
  return value;
}

function category(sourcePath: string, fieldPath: string, value: unknown): StyleEncodingCategory {
  if (
    typeof value !== "string" ||
    !(styleEncodingCategories as readonly string[]).includes(value)
  ) {
    return fail(sourcePath, fieldPath, "unknown Style encoding category");
  }
  return value as StyleEncodingCategory;
}

function field(sourcePath: string, fieldPath: string, value: unknown): RawStyleField {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name", "category", "description"], ["numericFamily"]);
  const fieldCategory = category(sourcePath, `${fieldPath}.category`, input.category);
  const hasNumericFamily = Object.hasOwn(input, "numericFamily");
  if (enumCategories.has(fieldCategory) !== hasNumericFamily) {
    fail(
      sourcePath,
      `${fieldPath}.numericFamily`,
      enumCategories.has(fieldCategory)
        ? `required for ${fieldCategory}`
        : `not valid for ${fieldCategory}`,
    );
  }
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    category: fieldCategory,
    description: string(sourcePath, `${fieldPath}.description`, input.description),
    ...(hasNumericFamily
      ? { numericFamily: string(sourcePath, `${fieldPath}.numericFamily`, input.numericFamily) }
      : {}),
  };
}

export function validateStyleCodec(value: unknown, sourcePath: string): RawStyleCodec {
  const input = record(sourcePath, "$", value);
  exactKeys(sourcePath, "$", input, ["$schema", "formatVersion", "wireVersion", "fields"]);
  if (input.$schema !== "./schemas/style-codec.schema.json") {
    fail(sourcePath, "$.$schema", 'expected "./schemas/style-codec.schema.json"');
  }
  if (input.formatVersion !== 1) fail(sourcePath, "$.formatVersion", "unsupported format version");
  if (
    typeof input.wireVersion !== "number" ||
    !Number.isInteger(input.wireVersion) ||
    input.wireVersion < 1 ||
    input.wireVersion > 255
  ) {
    fail(sourcePath, "$.wireVersion", "expected an integer from 1 through 255");
  }
  if (!Array.isArray(input.fields) || input.fields.length === 0 || input.fields.length > 48) {
    fail(sourcePath, "$.fields", "expected from 1 through 48 fields");
  }
  return {
    formatVersion: 1,
    wireVersion: input.wireVersion,
    fields: input.fields.map((value, index) => field(sourcePath, `$.fields[${index}]`, value)),
  };
}
