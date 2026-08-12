import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["tools/taffy-api/tests/**/*.test.mts"],
    retry: 0,
  },
});
