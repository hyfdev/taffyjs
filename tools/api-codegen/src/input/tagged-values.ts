import { CodegenError } from "../diagnostics.ts";

export interface RawTaggedPayload {
  readonly name: string;
  readonly type: "number";
}

export interface RawTaggedBranch {
  readonly name: string;
  readonly publicInput?: string;
  readonly payload?: RawTaggedPayload;
}

export interface RawTaggedAlias {
  readonly name: string;
  readonly branches: readonly string[];
  readonly acceptsNumber: boolean;
}

export interface RawNumberShorthand {
  readonly targetBranch: string;
}

export interface RawTaggedFamily {
  readonly name: string;
  readonly tagField: string;
  readonly numericFamily: string;
  readonly numberShorthand?: RawNumberShorthand;
  readonly branches: readonly RawTaggedBranch[];
  readonly publicAliases: readonly RawTaggedAlias[];
}

export interface RawTaggedValues {
  readonly formatVersion: 1;
  readonly families: readonly RawTaggedFamily[];
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
  optional: readonly string[] = [],
): void {
  const allowedKeys = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) fail(sourcePath, `${fieldPath}.${key}`, "unknown property");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) fail(sourcePath, `${fieldPath}.${key}`, "missing property");
  }
}

function string(sourcePath: string, fieldPath: string, value: unknown): string {
  if (typeof value !== "string") return fail(sourcePath, fieldPath, "expected a string");
  return value;
}

function boolean(sourcePath: string, fieldPath: string, value: unknown): boolean {
  if (typeof value !== "boolean") return fail(sourcePath, fieldPath, "expected a boolean");
  return value;
}

function array(sourcePath: string, fieldPath: string, value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) return fail(sourcePath, fieldPath, "expected an array");
  if (value.length === 0) return fail(sourcePath, fieldPath, "must not be empty");
  return value;
}

function payload(sourcePath: string, fieldPath: string, value: unknown): RawTaggedPayload {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name", "type"]);
  if (input.type !== "number") fail(sourcePath, `${fieldPath}.type`, 'expected "number"');
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    type: "number",
  };
}

function branch(sourcePath: string, fieldPath: string, value: unknown): RawTaggedBranch {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name"], ["publicInput", "payload"]);
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    ...(Object.hasOwn(input, "publicInput")
      ? { publicInput: string(sourcePath, `${fieldPath}.publicInput`, input.publicInput) }
      : {}),
    ...(Object.hasOwn(input, "payload")
      ? { payload: payload(sourcePath, `${fieldPath}.payload`, input.payload) }
      : {}),
  };
}

function publicAlias(sourcePath: string, fieldPath: string, value: unknown): RawTaggedAlias {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["name", "branches", "acceptsNumber"]);
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    branches: array(sourcePath, `${fieldPath}.branches`, input.branches).map((item, index) =>
      string(sourcePath, `${fieldPath}.branches[${index}]`, item),
    ),
    acceptsNumber: boolean(sourcePath, `${fieldPath}.acceptsNumber`, input.acceptsNumber),
  };
}

function numberShorthand(
  sourcePath: string,
  fieldPath: string,
  value: unknown,
): RawNumberShorthand {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(sourcePath, fieldPath, input, ["targetBranch"]);
  return {
    targetBranch: string(sourcePath, `${fieldPath}.targetBranch`, input.targetBranch),
  };
}

function family(sourcePath: string, fieldPath: string, value: unknown): RawTaggedFamily {
  const input = record(sourcePath, fieldPath, value);
  exactKeys(
    sourcePath,
    fieldPath,
    input,
    ["name", "tagField", "numericFamily", "branches", "publicAliases"],
    ["numberShorthand"],
  );
  return {
    name: string(sourcePath, `${fieldPath}.name`, input.name),
    tagField: string(sourcePath, `${fieldPath}.tagField`, input.tagField),
    numericFamily: string(sourcePath, `${fieldPath}.numericFamily`, input.numericFamily),
    ...(Object.hasOwn(input, "numberShorthand")
      ? {
          numberShorthand: numberShorthand(
            sourcePath,
            `${fieldPath}.numberShorthand`,
            input.numberShorthand,
          ),
        }
      : {}),
    branches: array(sourcePath, `${fieldPath}.branches`, input.branches).map((item, index) =>
      branch(sourcePath, `${fieldPath}.branches[${index}]`, item),
    ),
    publicAliases: array(sourcePath, `${fieldPath}.publicAliases`, input.publicAliases).map(
      (item, index) => publicAlias(sourcePath, `${fieldPath}.publicAliases[${index}]`, item),
    ),
  };
}

export function validateTaggedValues(value: unknown, sourcePath: string): RawTaggedValues {
  const input = record(sourcePath, "$", value);
  exactKeys(sourcePath, "$", input, ["$schema", "formatVersion", "families"]);
  if (input.$schema !== "./schemas/tagged-values.schema.json") {
    fail(sourcePath, "$.$schema", 'expected "./schemas/tagged-values.schema.json"');
  }
  if (input.formatVersion !== 1) fail(sourcePath, "$.formatVersion", "unsupported format version");
  return {
    formatVersion: 1,
    families: array(sourcePath, "$.families", input.families).map((item, index) =>
      family(sourcePath, `$.families[${index}]`, item),
    ),
  };
}
