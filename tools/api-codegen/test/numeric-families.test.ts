import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { compileNumericFamilies } from "../src/compiler/numeric-families.ts";
import { emitNumericFamiliesRust } from "../src/emit/numeric-families/rust.ts";
import { emitNumericFamiliesTypeScript } from "../src/emit/numeric-families/typescript.ts";
import { validateNumericFamilies } from "../src/input/numeric-families.ts";
import { formatOutputFiles } from "../src/output/format.ts";

const sourcePath = "api/numeric-families.json";

function input(families: unknown): Record<string, unknown> {
  return {
    $schema: "./schemas/numeric-families.schema.json",
    formatVersion: 1,
    families,
  };
}

test("input validation rejects unknown fields and invalid values", () => {
  assert.throws(
    () =>
      validateNumericFamilies(
        { ...input([{ name: "Example", members: [{ name: "First", value: 0 }] }]), extra: true },
        sourcePath,
      ),
    /\$\.extra: unknown property/,
  );
  assert.throws(
    () =>
      validateNumericFamilies(
        input([{ name: "Example", members: [{ name: "First", value: 256 }] }]),
        sourcePath,
      ),
    /expected an integer from 0 through 255/,
  );
});

test("compilation rejects names or values that would collide", () => {
  const compile = (families: unknown) =>
    compileNumericFamilies(validateNumericFamilies(input(families), sourcePath), sourcePath);

  assert.throws(
    () =>
      compile([
        { name: "Example", members: [{ name: "First", value: 0 }] },
        { name: "Example", members: [{ name: "Second", value: 1 }] },
      ]),
    /duplicate family Example/,
  );
  assert.throws(
    () =>
      compile([
        {
          name: "Example",
          members: [
            { name: "First", value: 0 },
            { name: "First", value: 1 },
          ],
        },
      ]),
    /duplicate member First/,
  );
  assert.throws(
    () =>
      compile([
        {
          name: "Example",
          members: [
            { name: "First", value: 0 },
            { name: "Second", value: 0 },
          ],
        },
      ]),
    /duplicate value 0/,
  );
  assert.throws(
    () => compile([{ name: "not-valid", members: [{ name: "First", value: 0 }] }]),
    /expected an upper-camel-case identifier/,
  );
  assert.throws(
    () => compile([{ name: "Example", members: [{ name: "Self", value: 0 }] }]),
    /Self is reserved in Rust/,
  );
});

test("both emitters preserve declared order and explicit values", () => {
  const model = compileNumericFamilies(
    validateNumericFamilies(
      input([
        {
          name: "GridAutoFlow",
          members: [
            { name: "Second", value: 7 },
            { name: "First", value: 3 },
          ],
        },
      ]),
      sourcePath,
    ),
    sourcePath,
  );

  const typescript = emitNumericFamiliesTypeScript(model).content;
  const rust = emitNumericFamiliesRust(model).content;
  assert.match(typescript, /supported grid auto flow choices/);
  assert.ok(typescript.indexOf("Second: 7") < typescript.indexOf("First: 3"));
  assert.ok(rust.indexOf("Second = 7") < rust.indexOf("First = 3"));
  assert.equal(emitNumericFamiliesTypeScript(model).content, typescript);
  assert.equal(emitNumericFamiliesRust(model).content, rust);
});

test("output formatting uses LF and one final newline", () => {
  assert.deepEqual(formatOutputFiles([{ path: "example.ts", content: "first\r\nsecond\n\n" }]), [
    { path: "example.ts", content: "first\nsecond\n" },
  ]);
});
