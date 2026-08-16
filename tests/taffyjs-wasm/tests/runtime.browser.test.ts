import { expect, test } from "vite-plus/test";

import { runBrowserSmoke } from "../browser/src/smoke.js";

test("package root runs in a non-isolated browser", () => {
  const result = runBrowserSmoke();

  expect(result).toEqual({
    marker: "taffyjs-wasm-browser-pass",
    crossOriginIsolated: false,
    sharedArrayBufferType: "undefined",
    measureCalls: 1,
    width: 41,
    height: 19,
    callbackIdentityPreserved: true,
    reusableAfterExpectedError: true,
  });
});
