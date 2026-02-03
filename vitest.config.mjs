import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // Next.js handles JSX via SWC; Vitest uses Vite/esbuild, so enable the modern JSX runtime
  // to avoid requiring `import React from "react"` in every JSX file.
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      "test-utils": fileURLToPath(new URL("./src/test-utils", import.meta.url)),
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
