import { CodegenError } from "../diagnostics.ts";
import type { RawNumericFamilies } from "../input/numeric-families.ts";

export interface NumericMember {
  readonly name: string;
  readonly value: number;
}

export interface NumericFamily {
  readonly name: string;
  readonly rustName: string;
  readonly label: string;
  readonly members: readonly NumericMember[];
}

export interface NumericFamiliesModel {
  readonly families: readonly NumericFamily[];
}

const identifier = /^[A-Z][A-Za-z0-9]*$/u;

function label(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/gu, "$1 $2")
    .toLowerCase();
}

export function compileNumericFamilies(
  input: RawNumericFamilies,
  sourcePath: string,
): NumericFamiliesModel {
  const familyNames = new Set<string>();
  const families = input.families.map((family, familyIndex): NumericFamily => {
    const familyPath = `${sourcePath}:$.families[${familyIndex}]`;
    if (!identifier.test(family.name)) {
      throw new CodegenError(`${familyPath}.name: expected an upper-camel-case identifier`);
    }
    if (familyNames.has(family.name)) {
      throw new CodegenError(`${familyPath}.name: duplicate family ${family.name}`);
    }
    familyNames.add(family.name);

    const memberNames = new Set<string>();
    const memberValues = new Set<number>();
    const members = family.members.map((member, memberIndex): NumericMember => {
      const memberPath = `${familyPath}.members[${memberIndex}]`;
      if (!identifier.test(member.name)) {
        throw new CodegenError(`${memberPath}.name: expected an upper-camel-case identifier`);
      }
      if (member.name === "Self") {
        throw new CodegenError(`${memberPath}.name: Self is reserved in Rust`);
      }
      if (memberNames.has(member.name)) {
        throw new CodegenError(`${memberPath}.name: duplicate member ${member.name}`);
      }
      if (memberValues.has(member.value)) {
        throw new CodegenError(`${memberPath}.value: duplicate value ${member.value}`);
      }
      memberNames.add(member.name);
      memberValues.add(member.value);
      return member;
    });

    return {
      name: family.name,
      rustName: `${family.name}Code`,
      label: label(family.name),
      members,
    };
  });
  return { families };
}
