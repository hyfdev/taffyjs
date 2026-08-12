import { test } from "vite-plus/test";

export function contractTest(id: string, body: () => unknown) {
  return test(id, body);
}
