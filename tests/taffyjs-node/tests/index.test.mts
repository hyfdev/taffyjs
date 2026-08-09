import { createRequire } from "node:module";
import { describe, expect, test } from "vite-plus/test";

const require = createRequire(import.meta.url);

describe("@taffyjs/node", () => {
  test("loads the native addon through the package entry point", () => {
    const binding = require("@taffyjs/node") as {
      __bootstrap: () => boolean;
    };

    expect(binding.__bootstrap()).toBe(true);
  });
});
