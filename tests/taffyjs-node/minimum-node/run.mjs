import assert from "node:assert/strict";
import { minimumNodeTest } from "./MATURITY-002.test.mjs";

assert.equal(process.version, "v22.18.0");
assert.equal(minimumNodeTest.id, "MATURITY-002/minimum-node");
const result = await minimumNodeTest.body();
assert.equal(result.packageResolution.specifier, "@taffyjs/node");
process.stdout.write(`${JSON.stringify(result)}\n`);
