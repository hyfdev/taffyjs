import { __bootstrap } from "@taffyjs/node";
import { describe, expect, test } from "vite-plus/test";

describe("@taffyjs/node", () => {
  test("imports the native addon through the ESM package entry point", () => {
    expect(__bootstrap()).toBe(true);
  });
});
