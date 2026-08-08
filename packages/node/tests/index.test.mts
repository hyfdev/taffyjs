import { createRequire } from "node:module";
import { describe, expect, test } from "vite-plus/test";

const require = createRequire(import.meta.url);

describe("@taffyjs/node", () => {
  test("loads the native addon", () => {
    const binding = require("../index.js") as {
      __bootstrap: () => boolean;
    };

    expect(binding.__bootstrap()).toBe(true);
  });
});
