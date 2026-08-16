import { test } from "vite-plus/test";

import { expectedFailureByTitle } from "./expected-failures.ts";

type OfficialTestCallback = () => void | Promise<void>;

const classifiedTest = ((title: string, callback: OfficialTestCallback, timeout?: number) => {
  const register = expectedFailureByTitle.has(title) ? test.fails : test;
  register(title, callback, timeout);
}) as typeof test;

Object.defineProperty(classifiedTest, "skip", { value: test.skip });

if (!Reflect.set(globalThis, "test", classifiedTest)) {
  throw new Error("Unable to install the Yoga official test classifier");
}
