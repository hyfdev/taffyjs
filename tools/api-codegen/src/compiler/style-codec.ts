import { CodegenError } from "../diagnostics.ts";
import type { RawStyleCodec, StyleEncodingCategory } from "../input/style-codec.ts";
import type { NumericFamiliesModel, NumericFamily } from "./numeric-families.ts";

export interface StyleField {
  readonly index: number;
  readonly name: string;
  readonly rustName: string;
  readonly category: StyleEncodingCategory;
  readonly description: string;
  readonly numericFamily?: NumericFamily;
  readonly enumMask?: number;
}

export interface StyleCodecModel {
  readonly wireVersion: number;
  readonly presenceBytes: number;
  readonly fields: readonly StyleField[];
}

const fieldIdentifier = /^[a-z][A-Za-z0-9]*$/u;

function rustName(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .toLowerCase();
}

export function compileStyleCodec(
  input: RawStyleCodec,
  sourcePath: string,
  numericModel: NumericFamiliesModel,
): StyleCodecModel {
  const numericFamilies = new Map(
    numericModel.families.map((family) => [family.name, family] as const),
  );
  const names = new Set<string>();
  const fields = input.fields.map((field, index): StyleField => {
    const fieldPath = `${sourcePath}:$.fields[${index}]`;
    if (!fieldIdentifier.test(field.name)) {
      throw new CodegenError(`${fieldPath}.name: expected a lower-camel-case identifier`);
    }
    if (names.has(field.name)) {
      throw new CodegenError(`${fieldPath}.name: duplicate Style field ${field.name}`);
    }
    names.add(field.name);

    const numericFamily =
      field.numericFamily === undefined ? undefined : numericFamilies.get(field.numericFamily);
    if (field.numericFamily !== undefined && numericFamily === undefined) {
      throw new CodegenError(
        `${fieldPath}.numericFamily: unknown numeric family ${field.numericFamily}`,
      );
    }
    if (numericFamily !== undefined && numericFamily.members.some((member) => member.value > 30)) {
      throw new CodegenError(
        `${fieldPath}.numericFamily: ${numericFamily.name} has a value above the compact enum limit`,
      );
    }
    const enumMask = numericFamily?.members.reduce((mask, member) => mask | (1 << member.value), 0);
    return {
      index,
      name: field.name,
      rustName: rustName(field.name),
      category: field.category,
      description: field.description,
      ...(numericFamily === undefined ? {} : { numericFamily, enumMask: enumMask ?? 0 }),
    };
  });
  return {
    wireVersion: input.wireVersion,
    presenceBytes: Math.ceil(fields.length / 8),
    fields,
  };
}
