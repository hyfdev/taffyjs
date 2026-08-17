import { TaffyTree } from "@taffyjs/wasm";

export interface BrowserSmokeResult {
  readonly marker: "taffyjs-wasm-browser-pass";
  readonly crossOriginIsolated: boolean;
  readonly sharedArrayBufferType: string;
  readonly measureCalls: number;
  readonly width: number;
  readonly height: number;
  readonly callbackIdentityPreserved: boolean;
  readonly reusableAfterExpectedError: boolean;
}

export function runBrowserSmoke(): BrowserSmokeResult {
  const tree = new TaffyTree<{ label: string }>();
  const root = tree.newLeafWithContext({}, { label: "wasm-browser" });
  let measureCalls = 0;

  tree.computeLayout({
    root,
    availableSpace: { width: 800, height: 600 },
    measure(args) {
      measureCalls += 1;
      if (args.node !== root || args.context?.label !== "wasm-browser") {
        throw new Error("Measure callback received the wrong node or context");
      }
      return { width: 31, height: 17 };
    },
  });

  let indexError: unknown;
  try {
    tree.getChildAtIndex(root, -1);
  } catch (error) {
    indexError = error;
  }
  if (!(indexError instanceof RangeError)) throw new Error("Expected a controlled RangeError");

  const thrown = { source: "browser-measure" };
  let callbackError: unknown;
  tree.markDirty(root);
  try {
    tree.computeLayout({
      root,
      availableSpace: { width: 800, height: 600 },
      measure: () => {
        throw thrown;
      },
    });
  } catch (error) {
    callbackError = error;
  }
  if (callbackError !== thrown) throw new Error("Measure callback error identity changed");

  tree.markDirty(root);
  tree.computeLayout({
    root,
    availableSpace: { width: 800, height: 600 },
    measure: () => ({ width: 41, height: 19 }),
  });
  const layout = tree.getLayout(root);
  if (measureCalls === 0 || layout.size.width !== 41 || layout.size.height !== 19) {
    throw new Error("Unexpected browser Wasm layout result");
  }

  return {
    marker: "taffyjs-wasm-browser-pass",
    crossOriginIsolated: globalThis.crossOriginIsolated,
    sharedArrayBufferType: typeof globalThis.SharedArrayBuffer,
    measureCalls,
    width: layout.size.width,
    height: layout.size.height,
    callbackIdentityPreserved: true,
    reusableAfterExpectedError: true,
  };
}
