import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      benchmark: {
        command: "node run.ts",
      },
      "benchmark:update-website": {
        command: "node run.ts --update-website",
      },
    },
  },
});
