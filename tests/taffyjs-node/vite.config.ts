import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["tests/**/*.test.mts"],
    retry: 0,
    sequence: { concurrent: true },
  },
});
