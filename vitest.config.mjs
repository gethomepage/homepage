import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      utils: fileURLToPath(new URL("./src/utils", import.meta.url)),
      widgets: fileURLToPath(new URL("./src/widgets", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.{js,jsx}", "src/**/*.spec.{js,jsx}"],
  },
});
