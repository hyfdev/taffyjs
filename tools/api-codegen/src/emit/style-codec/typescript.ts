import type { StyleField, StyleCodecModel } from "../../compiler/style-codec.ts";
import type { OutputFile } from "../../index.ts";

const publicTypeByCategory = {
  boolean: "boolean",
  number: "number",
  "nullable-number": "number | null",
  "partial-rect-length-percentage-auto":
    "LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput>",
  "partial-size-dimension": "DimensionInput | PartialSizeInput<DimensionInput>",
  "partial-rect-length-percentage":
    "LengthPercentageInput | PartialRectInput<LengthPercentageInput>",
  "partial-size-length-percentage":
    "LengthPercentageInput | PartialSizeInput<LengthPercentageInput>",
  dimension: "DimensionInput",
  "grid-template-component-array": "readonly GridTemplateComponentInput[]",
  "track-sizing-array": "readonly TrackSizingFunctionInput[]",
  "nullable-grid-template-areas": "GridTemplateAreasInput | null",
  "string-matrix": "readonly (readonly string[])[]",
  "partial-line-grid-placement": "PartialLineInput<GridPlacementInput>",
} as const;

function publicType(field: StyleField): string {
  if (
    field.category === "enum" ||
    field.category === "nullable-enum" ||
    field.category === "partial-point-enum"
  ) {
    const family = field.numericFamily?.name;
    if (family === undefined) throw new Error(`Missing numeric family for ${field.name}`);
    if (field.category === "nullable-enum") return `${family} | null`;
    if (field.category === "partial-point-enum") return `PartialPointInput<${family}>`;
    return family;
  }
  return publicTypeByCategory[field.category];
}

function encoderCall(field: StyleField): string {
  const name = JSON.stringify(`Style.${field.name}`);
  switch (field.category) {
    case "boolean":
      return `encoder.boolean(value, ${name});`;
    case "number":
      return `encoder.number(value, ${name});`;
    case "nullable-number":
      return `encoder.nullableNumber(value, ${name});`;
    case "enum":
      return `encoder.enumeration(value, ${field.enumMask ?? 0}, ${name});`;
    case "nullable-enum":
      return `encoder.nullableEnumeration(value, ${field.enumMask ?? 0}, ${name});`;
    case "partial-point-enum":
      return `encoder.partialPointEnumeration(value, ${field.enumMask ?? 0}, ${name});`;
    case "partial-rect-length-percentage-auto":
      return `encoder.partialRectLengthPercentageAuto(value, ${name});`;
    case "partial-size-dimension":
      return `encoder.partialSizeDimension(value, ${name});`;
    case "partial-rect-length-percentage":
      return `encoder.partialRectLengthPercentage(value, ${name});`;
    case "partial-size-length-percentage":
      return `encoder.partialSizeLengthPercentage(value, ${name});`;
    case "dimension":
      return `encoder.dimension(value, ${name});`;
    case "grid-template-component-array":
      return `encoder.gridTemplateComponents(value, ${name});`;
    case "track-sizing-array":
      return `encoder.trackSizingFunctions(value, ${name});`;
    case "nullable-grid-template-areas":
      return `encoder.nullableGridTemplateAreas(value, ${name});`;
    case "string-matrix":
      return `encoder.stringMatrix(value, ${name});`;
    case "partial-line-grid-placement":
      return `encoder.partialLineGridPlacement(value, ${name});`;
  }
}

function emitFieldEncoder(lines: string[], field: StyleField): void {
  lines.push(
    `    const ${field.name} = style.${field.name};`,
    `    if (${field.name} !== undefined) {`,
    `      encoder.field(${field.index});`,
    `      const value = ${field.name};`,
    `      ${encoderCall(field)}`,
    "    }",
  );
}

function emitTypeImport(lines: string[], names: readonly string[], path: string): void {
  lines.push("import type {");
  for (const name of names) lines.push(`  ${name},`);
  lines.push(`} from ${JSON.stringify(path)};`);
}

function emitPublicField(lines: string[], field: StyleField): void {
  const type = publicType(field);
  const singleLine = `  /** ${field.description} */ ${field.name}?: ${type} | undefined;`;
  if (singleLine.length <= 100) {
    lines.push(singleLine);
    return;
  }
  lines.push(`  /** ${field.description} */ ${field.name}?:`);
  const members = [...type.split(" | "), "undefined"];
  for (const [index, member] of members.entries()) {
    lines.push(`    | ${member}${index === members.length - 1 ? ";" : ""}`);
  }
}

export function emitStyleCodecTypeScript(model: StyleCodecModel): OutputFile {
  const numericFamilies = [
    ...new Set(
      model.fields.flatMap((field) =>
        field.numericFamily === undefined ? [] : [field.numericFamily.name],
      ),
    ),
  ].toSorted();
  const publicTypes = [
    "GridPlacementInput",
    "GridTemplateAreasInput",
    "GridTemplateComponentInput",
    "PartialLineInput",
    "PartialPointInput",
    "PartialRectInput",
    "PartialSizeInput",
    "TrackSizingFunctionInput",
  ];
  const taggedTypes = ["DimensionInput", "LengthPercentageAutoInput", "LengthPercentageInput"];
  const lines = [
    "// Code generated by tools/api-codegen. DO NOT EDIT.",
    "// Sources: api/numeric-families.json, api/style-codec.json",
    "// Regenerate: vp run codegen",
    "",
  ];
  emitTypeImport(lines, numericFamilies, "./numeric-families.js");
  emitTypeImport(lines, publicTypes, "./public-types.js");
  emitTypeImport(lines, taggedTypes, "./tagged-values.js");
  lines.push(
    'import { withStyleEncoder } from "./style-codec.js";',
    "",
    "/** Supplies style fields; creation and setStyle use defaults for omitted fields. */",
    "export interface StyleInput {",
  );
  for (const field of model.fields) emitPublicField(lines, field);
  lines.push(
    "}",
    "",
    "/** Supplies style fields to update; omitted or undefined fields and geometry components are preserved. */",
    "export type StyleUpdate = StyleInput;",
    "",
    "export function withEncodedStyle<T>(style: StyleInput, use: (encoded: Uint8Array) => T): T {",
    `  return withStyleEncoder(style, ${model.wireVersion}, ${model.presenceBytes}, (encoder) => {`,
  );
  for (const field of model.fields) emitFieldEncoder(lines, field);
  lines.push("    return use(encoder.finish());", "  });", "}");

  return {
    path: "packages/taffyjs-node/src/style-input.ts",
    content: lines.join("\n"),
  };
}
