import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.{js,jsx}", "src/**/*.spec.{js,jsx}"],
  },
});
