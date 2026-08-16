import { runBrowserSmoke, type BrowserSmokeResult } from "./smoke.js";

declare global {
  interface Window {
    __TAFFY_WASM_SMOKE__?: BrowserSmokeResult;
  }
}

const status = document.querySelector<HTMLOutputElement>("#status");
if (!status) throw new Error("Missing browser smoke-test output");

try {
  const result = runBrowserSmoke();
  window.__TAFFY_WASM_SMOKE__ = result;
  status.dataset.result = "pass";
  status.textContent = JSON.stringify(result);
} catch (error) {
  status.dataset.result = "fail";
  status.textContent = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  throw error;
}
