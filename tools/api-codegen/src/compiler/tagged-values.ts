import { CodegenError } from "../diagnostics.ts";
import type { RawTaggedValues } from "../input/tagged-values.ts";
import type { NumericFamiliesModel, NumericFamily, NumericMember } from "./numeric-families.ts";

export interface TaggedPayload {
  readonly name: string;
  readonly type: "number";
}

export interface TaggedBranch {
  readonly name: string;
  readonly numericMember: NumericMember;
  readonly typeName: string;
  readonly publicInput: boolean;
  readonly payload?: TaggedPayload;
}

export interface TaggedAlias {
  readonly name: string;
  readonly rustName: string;
  readonly inputName: string;
  readonly outputName: string;
  readonly branches: readonly TaggedBranch[];
  readonly acceptsNumber: boolean;
}

export interface NumberShorthand {
  readonly targetBranch: TaggedBranch;
}

export interface TaggedFamily {
  readonly name: string;
  readonly label: string;
  readonly camelName: string;
  readonly rustName: string;
  readonly tagField: string;
  readonly numericFamily: NumericFamily;
  readonly branches: readonly TaggedBranch[];
  readonly publicAliases: readonly TaggedAlias[];
  readonly numberShorthand?: NumberShorthand;
  readonly payloadFields: readonly TaggedPayload[];
}

export interface TaggedValuesModel {
  readonly families: readonly TaggedFamily[];
}

const upperIdentifier = /^[A-Z][A-Za-z0-9]*$/u;
const fieldIdentifier = /^[a-z][a-z0-9_]*$/u;

function label(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/gu, "$1 $2")
    .toLowerCase();
}

function camelName(name: string): string {
  return `${name[0]?.toLowerCase() ?? ""}${name.slice(1)}`;
}

function rustName(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .toLowerCase();
}

function addName(names: Set<string>, path: string, name: string): void {
  if (names.has(name)) throw new CodegenError(`${path}: duplicate public name ${name}`);
  names.add(name);
}

function addRustParserName(names: Set<string>, path: string, name: string): void {
  if (names.has(name)) {
    throw new CodegenError(`${path}: generated Rust parser name ${name} is already in use`);
  }
  names.add(name);
}

export function compileTaggedValues(
  input: RawTaggedValues,
  sourcePath: string,
  numericModel: NumericFamiliesModel,
): TaggedValuesModel {
  const numericFamilies = new Map(
    numericModel.families.map((family) => [family.name, family] as const),
  );
  const familyNames = new Set<string>();
  const emittedTypeNames = new Set<string>();
  const rustParserNames = new Set<string>();

  const families = input.families.map((family, familyIndex): TaggedFamily => {
    const familyPath = `${sourcePath}:$.families[${familyIndex}]`;
    if (!upperIdentifier.test(family.name)) {
      throw new CodegenError(`${familyPath}.name: expected an upper-camel-case identifier`);
    }
    if (familyNames.has(family.name)) {
      throw new CodegenError(`${familyPath}.name: duplicate family ${family.name}`);
    }
    familyNames.add(family.name);
    const familyRustName = rustName(family.name);
    addRustParserName(rustParserNames, `${familyPath}.name`, `${familyRustName}_tagged_value`);
    if (!fieldIdentifier.test(family.tagField)) {
      throw new CodegenError(`${familyPath}.tagField: expected a lower-case field identifier`);
    }

    const numericFamily = numericFamilies.get(family.numericFamily);
    if (numericFamily === undefined) {
      throw new CodegenError(
        `${familyPath}.numericFamily: unknown numeric family ${family.numericFamily}`,
      );
    }
    const numericMembers = new Map(
      numericFamily.members.map((member) => [member.name, member] as const),
    );

    const branchNames = new Set<string>();
    const branches = family.branches.map((branch, branchIndex): TaggedBranch => {
      const branchPath = `${familyPath}.branches[${branchIndex}]`;
      if (!upperIdentifier.test(branch.name)) {
        throw new CodegenError(`${branchPath}.name: expected an upper-camel-case identifier`);
      }
      if (branchNames.has(branch.name)) {
        throw new CodegenError(`${branchPath}.name: duplicate branch ${branch.name}`);
      }
      branchNames.add(branch.name);

      const numericMember = numericMembers.get(branch.name);
      if (numericMember === undefined) {
        throw new CodegenError(
          `${branchPath}.name: ${branch.name} is not a member of ${numericFamily.name}`,
        );
      }

      if (branch.payload !== undefined) {
        if (!fieldIdentifier.test(branch.payload.name)) {
          throw new CodegenError(
            `${branchPath}.payload.name: expected a lower-case field identifier`,
          );
        }
        if (branch.payload.name === family.tagField) {
          throw new CodegenError(
            `${branchPath}.payload.name: payload field conflicts with tag field ${family.tagField}`,
          );
        }
      }

      const typeName = branch.publicInput ?? `${family.name}${branch.name}Input`;
      if (!upperIdentifier.test(typeName)) {
        throw new CodegenError(`${branchPath}.publicInput: expected a TypeScript identifier`);
      }
      if (branch.publicInput !== undefined && !branch.publicInput.endsWith("Input")) {
        throw new CodegenError(`${branchPath}.publicInput: public input names must end in Input`);
      }
      addName(emittedTypeNames, `${branchPath}.publicInput`, typeName);
      return {
        name: branch.name,
        numericMember,
        typeName,
        publicInput: branch.publicInput !== undefined,
        ...(branch.payload === undefined ? {} : { payload: branch.payload }),
      };
    });

    for (const member of numericFamily.members) {
      if (!branchNames.has(member.name)) {
        throw new CodegenError(
          `${familyPath}.branches: missing ${numericFamily.name} branch ${member.name}`,
        );
      }
    }
    if (branches.length !== numericFamily.members.length) {
      throw new CodegenError(
        `${familyPath}.branches: expected exactly one branch for each ${numericFamily.name} member`,
      );
    }

    const branchesByName = new Map(branches.map((branch) => [branch.name, branch] as const));
    const aliasNames = new Set<string>();
    const publicAliases = family.publicAliases.map((alias, aliasIndex): TaggedAlias => {
      const aliasPath = `${familyPath}.publicAliases[${aliasIndex}]`;
      if (!upperIdentifier.test(alias.name)) {
        throw new CodegenError(`${aliasPath}.name: expected an upper-camel-case identifier`);
      }
      if (aliasNames.has(alias.name)) {
        throw new CodegenError(`${aliasPath}.name: duplicate public alias ${alias.name}`);
      }
      aliasNames.add(alias.name);

      const selectedNames = new Set<string>();
      const selectedBranches = alias.branches.map((branchName, branchIndex) => {
        const branchPath = `${aliasPath}.branches[${branchIndex}]`;
        if (selectedNames.has(branchName)) {
          throw new CodegenError(`${branchPath}: duplicate branch ${branchName}`);
        }
        selectedNames.add(branchName);
        const branch = branchesByName.get(branchName);
        if (branch === undefined) {
          throw new CodegenError(`${branchPath}: unknown branch ${branchName}`);
        }
        return branch;
      });

      const inputName = `${alias.name}Input`;
      addName(emittedTypeNames, `${aliasPath}.name`, inputName);
      addName(emittedTypeNames, `${aliasPath}.name`, alias.name);
      const aliasRustName = rustName(alias.name);
      addRustParserName(rustParserNames, `${aliasPath}.name`, aliasRustName);
      return {
        name: alias.name,
        rustName: aliasRustName,
        inputName,
        outputName: alias.name,
        branches: selectedBranches,
        acceptsNumber: alias.acceptsNumber,
      };
    });

    const shorthand = family.numberShorthand;
    let numberShorthand: NumberShorthand | undefined;
    if (shorthand !== undefined) {
      const targetBranch = branchesByName.get(shorthand.targetBranch);
      if (targetBranch === undefined) {
        throw new CodegenError(
          `${familyPath}.numberShorthand.targetBranch: unknown branch ${shorthand.targetBranch}`,
        );
      }
      if (targetBranch.payload?.type !== "number") {
        throw new CodegenError(
          `${familyPath}.numberShorthand.targetBranch: ${targetBranch.name} does not carry a number`,
        );
      }
      numberShorthand = { targetBranch };
    }

    for (const [aliasIndex, alias] of publicAliases.entries()) {
      if (alias.acceptsNumber && numberShorthand === undefined) {
        throw new CodegenError(
          `${familyPath}.publicAliases[${aliasIndex}].acceptsNumber: family has no number shorthand`,
        );
      }
      if (
        alias.acceptsNumber &&
        !alias.branches.some((branch) => branch === numberShorthand?.targetBranch)
      ) {
        throw new CodegenError(
          `${familyPath}.publicAliases[${aliasIndex}].branches: number shorthand target is not accepted`,
        );
      }
    }
    if (numberShorthand !== undefined && !publicAliases.some((alias) => alias.acceptsNumber)) {
      throw new CodegenError(
        `${familyPath}.numberShorthand: no public input alias accepts the shorthand`,
      );
    }

    const payloadFields = new Map<string, TaggedPayload>();
    for (const branch of branches) {
      if (branch.payload !== undefined) payloadFields.set(branch.payload.name, branch.payload);
    }

    return {
      name: family.name,
      label: label(family.name),
      camelName: camelName(family.name),
      rustName: familyRustName,
      tagField: family.tagField,
      numericFamily,
      branches,
      publicAliases,
      ...(numberShorthand === undefined ? {} : { numberShorthand }),
      payloadFields: [...payloadFields.values()],
    };
  });

  return { families };
}
