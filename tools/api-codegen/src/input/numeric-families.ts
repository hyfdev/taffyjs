import { CodegenError } from "../diagnostics.ts";

export interface RawNumericMember {
  readonly name: string;
  readonly value: number;
}

export interface RawNumericFamily {
  readonly name: string;
  readonly members: readonly RawNumericMember[];
}

export interface RawNumericFamilies {
  readonly formatVersion: 1;
  readonly families: readonly RawNumericFamily[];
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
  expected: readonly string[],
): void {
  const expectedKeys = new Set(expected);
  for (const key of Object.keys(value)) {
    if (!expectedKeys.has(key)) fail(sourcePath, `${fieldPath}.${key}`, "unknown property");
  }
  for (const key of expected) {
    if (!Object.hasOwn(value, key)) fail(sourcePath, `${fieldPath}.${key}`, "missing property");
  }
}

function string(sourcePath: string, fieldPath: string, value: unknown): string {
  if (typeof value !== "string") return fail(sourcePath, fieldPath, "expected a string");
  return value;
}

function array(sourcePath: string, fieldPath: string, value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) return fail(sourcePath, fieldPath, "expected an array");
  if (value.length === 0) return fail(sourcePath, fieldPath, "must not be empty");
  return value;
}

function member(sourcePath: string, fieldPath: string, value: unknown): RawNumericMember {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name", "value"]);
  const number = input.value;
  if (typeof number !== "number" || !Number.isInteger(number) || number < 0 || number > 255) {
    return fail(sourcePath, `${fieldPath}.value`, "expected an integer from 0 through 255");
  }
  return { name: string(sourcePath, `${fieldPath}.name`, input.name), value: number };
}

function family(sourcePath: string, fieldPath: string, value: unknown): RawNumericFamily {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name", "members"]);
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    members: array(sourcePath, `${fieldPath}.members`, input.members).map((item, index) =>
      member(sourcePath, `${fieldPath}.members[${index}]`, item),
    ),
  };
}

export function validateNumericFamilies(value: unknown, sourcePath: string): RawNumericFamilies {
  const input = record(sourcePath, "$", value);
  exactKeys(sourcePath, "$", input, ["$schema", "formatVersion", "families"]);
  if (input.$schema !== "./schemas/numeric-families.schema.json") {
    fail(sourcePath, "$.$schema", 'expected "./schemas/numeric-families.schema.json"');
  }
  if (input.formatVersion !== 1) fail(sourcePath, "$.formatVersion", "unsupported format version");
  return {
    formatVersion: 1,
    families: array(sourcePath, "$.families", input.families).map((item, index) =>
      family(sourcePath, `$.families[${index}]`, item),
    ),
  };
}
