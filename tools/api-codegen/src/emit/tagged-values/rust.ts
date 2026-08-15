import type {
  TaggedAlias,
  TaggedBranch,
  TaggedFamily,
  TaggedValuesModel,
} from "../../compiler/tagged-values.ts";
import type { OutputFile } from "../../index.ts";

function enumVariant(branch: TaggedBranch): string {
  return branch.payload === undefined ? branch.name : `${branch.name}(f64)`;
}

function emitFunctionStart(
  lines: string[],
  name: string,
  returnName: string,
  extraParameter?: string,
  visibility = "pub(crate) ",
): void {
  const parameters =
    extraParameter === undefined ? "value: Unknown<'_>" : `value: Unknown<'_>, ${extraParameter}`;
  const signature = `${visibility}fn ${name}(${parameters}) -> NativeResult<${returnName}> {`;
  if (signature.length <= 100) {
    lines.push(signature);
    return;
  }
  lines.push(
    `${visibility}fn ${name}(`,
    "    value: Unknown<'_>,",
    ...(extraParameter === undefined ? [] : [`    ${extraParameter},`]),
    `) -> NativeResult<${returnName}> {`,
  );
}

function emitAlias(lines: string[], family: TaggedFamily, alias: TaggedAlias): void {
  const taggedEnumName = `${family.name}TaggedValue`;
  const aliasEnumName = `${alias.name}InputValue`;
  const acceptedBranches = new Set(alias.branches);
  lines.push("", "#[derive(Clone, Copy, Debug, PartialEq)]", `pub(crate) enum ${aliasEnumName} {`);
  for (const branch of alias.branches) lines.push(`    ${enumVariant(branch)},`);
  lines.push("}", "");
  emitFunctionStart(lines, `parse_${alias.rustName}`, aliasEnumName);
  const callArguments =
    family.numberShorthand === undefined ? "value" : `value, ${alias.acceptsNumber}`;
  lines.push(
    `    let parsed = parse_${family.rustName}_tagged_value(${callArguments})?;`,
    "    Ok(match parsed {",
  );
  for (const branch of family.branches) {
    const payload = branch.payload === undefined ? "" : "(payload)";
    if (acceptedBranches.has(branch)) {
      lines.push(
        `        ${taggedEnumName}::${branch.name}${payload} => ${aliasEnumName}::${branch.name}${payload},`,
      );
    } else {
      const ignoredPayload = branch.payload === undefined ? "" : "(_)";
      lines.push(
        `        ${taggedEnumName}::${branch.name}${ignoredPayload} => {`,
        `            return Err(type_error("${branch.name} is not valid for ${alias.inputName}"));`,
        "        }",
      );
    }
  }
  lines.push("    })", "}");
}

function emitFamily(lines: string[], family: TaggedFamily): void {
  const inputName = `${family.name}TaggedInput`;
  const enumName = `${family.name}TaggedValue`;
  lines.push(
    "",
    "#[napi(object, object_to_js = false)]",
    `pub struct ${inputName} {`,
    `    pub ${family.tagField}: f64,`,
  );
  for (const payload of family.payloadFields) lines.push(`    pub ${payload.name}: Option<f64>,`);
  lines.push("}", "", "#[derive(Clone, Copy, Debug, PartialEq)]", `enum ${enumName} {`);
  for (const branch of family.branches) lines.push(`    ${enumVariant(branch)},`);
  const shorthand = family.numberShorthand;
  lines.push("}", "");
  emitFunctionStart(
    lines,
    `parse_${family.rustName}_tagged_value`,
    enumName,
    shorthand === undefined ? undefined : "accepts_number: bool",
    "",
  );
  if (shorthand !== undefined) {
    lines.push(
      "    if value",
      "        .get_type()",
      `        .map_err(|_| type_error("Could not inspect ${family.label} input"))?`,
      "        == ValueType::Number",
      "    {",
      "        if !accepts_number {",
      `            return Err(type_error("Expected a tagged ${family.label} object"));`,
      "        }",
      `        return Ok(${enumName}::${shorthand.targetBranch.name}(number::from_unknown(`,
      "            value,",
      `            "${family.name} shorthand",`,
      "        )?));",
      "    }",
    );
  }
  const inputLine = `    let input: ${inputName} = js_object::input(value, "a tagged ${family.label} object", None)?;`;
  lines.push("");
  if (inputLine.length <= 100) {
    lines.push(inputLine);
  } else {
    lines.push(
      `    let input: ${inputName} =`,
      `        js_object::input(value, "a tagged ${family.label} object", None)?;`,
    );
  }
  lines.push(
    `    let tag = number::to_integer::<${family.numericFamily.rustName}>(input.${family.tagField})?;`,
    "    let parsed = match tag {",
  );
  for (const branch of family.branches) {
    const code = `${family.numericFamily.rustName}::${branch.name}`;
    if (branch.payload === undefined) {
      lines.push(`        ${code} => ${enumName}::${branch.name},`);
    } else {
      lines.push(
        `        ${code} => {`,
        `            let payload = js_object::required(input.${branch.payload.name}, "${branch.name} value")?;`,
        `            ${enumName}::${branch.name}(payload)`,
        "        }",
      );
    }
  }
  lines.push("    };", "    Ok(parsed)", "}");
  for (const alias of family.publicAliases) emitAlias(lines, family, alias);
}

export function emitTaggedValuesRust(model: TaggedValuesModel): OutputFile {
  const numericCodes = model.families.map((family) => family.numericFamily.rustName).toSorted();
  const hasNumberShorthand = model.families.some((family) => family.numberShorthand !== undefined);
  const lines = [
    "// Code generated by tools/api-codegen. DO NOT EDIT.",
    "// Sources: api/numeric-families.json, api/tagged-values.json",
    "// Regenerate: vp run codegen",
    "",
    ...(hasNumberShorthand ? ["use napi::ValueType;"] : []),
    "use napi::bindgen_prelude::Unknown;",
    "use napi_derive::napi;",
    "",
    "use crate::error::{NativeResult, type_error};",
    "use crate::js_object;",
    "use crate::number;",
    `use crate::numeric::{${numericCodes.join(", ")}};`,
  ];

  for (const family of model.families) emitFamily(lines, family);

  return {
    path: "crates/taffyjs_binding/src/tagged_values.rs",
    content: lines.join("\n"),
  };
}
