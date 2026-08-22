import { CodegenError } from "../diagnostics.ts";
import type { RawLayoutCodec, RawLayoutShape } from "../input/layout-codec.ts";

export interface LayoutComponent {
  readonly name: string;
  readonly rustName: string;
}

export interface LayoutField {
  readonly name: string;
  readonly rustName: string;
  readonly shape: RawLayoutShape;
  readonly typeName: string;
  readonly components: readonly LayoutComponent[];
  readonly documentation: string;
}

export interface LayoutSlot {
  readonly index: number;
  readonly constantName: string;
  readonly typescriptPath: string;
  readonly rustPath: string;
}

export interface LayoutCodecModel {
  readonly fields: readonly LayoutField[];
  readonly slots: readonly LayoutSlot[];
  readonly byteLength: number;
}

// Pinned deliberately. Changing the slot count changes the public Layout shape, so this pin and
// the maintained model must be updated together rather than one drifting behind the other.
const pinnedSlotCount = 21;
const identifier = /^[a-z][A-Za-z0-9]*$/u;
const shapeDefinitions: Readonly<
  Record<RawLayoutShape, { readonly typeName: string; readonly components: readonly string[] }>
> = {
  number: { typeName: "number", components: [] },
  point: { typeName: "Point<number>", components: ["x", "y"] },
  size: { typeName: "Size<number>", components: ["width", "height"] },
  rect: { typeName: "Rect<number>", components: ["left", "right", "top", "bottom"] },
};

function snakeCase(name: string): string {
  return name.replace(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`);
}

function upperSnakeCase(name: string): string {
  return snakeCase(name).toUpperCase();
}

export function compileLayoutCodec(input: RawLayoutCodec, sourcePath: string): LayoutCodecModel {
  const fieldNames = new Set<string>();
  const fields = input.fields.map((field, fieldIndex): LayoutField => {
    const fieldPath = `${sourcePath}:$.fields[${fieldIndex}]`;
    if (!identifier.test(field.name)) {
      throw new CodegenError(`${fieldPath}.name: expected a lower-camel-case identifier`);
    }
    if (fieldNames.has(field.name)) {
      throw new CodegenError(`${fieldPath}.name: duplicate field ${field.name}`);
    }
    fieldNames.add(field.name);

    const definition = shapeDefinitions[field.shape];
    if (
      field.components.length !== definition.components.length ||
      field.components.some((component, index) => component !== definition.components[index])
    ) {
      throw new CodegenError(
        `${fieldPath}.components: ${field.shape} fields require [${definition.components.join(", ")}] in slot order`,
      );
    }
    const componentNames = new Set<string>();
    const components = field.components.map((component, componentIndex): LayoutComponent => {
      if (!identifier.test(component)) {
        throw new CodegenError(
          `${fieldPath}.components[${componentIndex}]: expected a lower-camel-case identifier`,
        );
      }
      if (componentNames.has(component)) {
        throw new CodegenError(
          `${fieldPath}.components[${componentIndex}]: duplicate component ${component}`,
        );
      }
      componentNames.add(component);
      return { name: component, rustName: snakeCase(component) };
    });
    return {
      name: field.name,
      rustName: snakeCase(field.name),
      shape: field.shape,
      typeName: definition.typeName,
      components,
      documentation: field.documentation,
    };
  });

  const slots: LayoutSlot[] = [];
  for (const field of fields) {
    if (field.components.length === 0) {
      slots.push({
        index: slots.length,
        constantName: `${upperSnakeCase(field.name)}_SLOT`,
        typescriptPath: field.name,
        rustPath: field.rustName,
      });
      continue;
    }
    for (const component of field.components) {
      slots.push({
        index: slots.length,
        constantName: `${upperSnakeCase(field.name)}_${upperSnakeCase(component.name)}_SLOT`,
        typescriptPath: `${field.name}.${component.name}`,
        rustPath: `${field.rustName}.${component.rustName}`,
      });
    }
  }
  if (slots.length !== pinnedSlotCount) {
    throw new CodegenError(
      `${sourcePath}:$.fields: Layout output is pinned at ${pinnedSlotCount} slots; update this pin together with the maintained model`,
    );
  }
  return { fields, slots, byteLength: slots.length * Float64Array.BYTES_PER_ELEMENT };
}
