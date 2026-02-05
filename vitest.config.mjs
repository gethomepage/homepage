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
      pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
      styles: fileURLToPath(new URL("./src/styles", import.meta.url)),
      "test-utils": fileURLToPath(new URL("./src/test-utils", import.meta.url)),
      utils: fileURLToPath(new URL("./src/utils", import.meta.url)),
      widgets: fileURLToPath(new URL("./src/widgets", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Use worker threads instead of forked processes to reduce overhead and avoid noisy per-process Node warnings.
    pool: "threads",
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.{js,jsx}", "src/**/*.spec.{js,jsx}"],
    coverage: {
      provider: "v8",
      all: true,
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        // Ignore build artifacts / generated reports
        ".next/**",
        "coverage/**",
        // Exclude tests and test harness code from coverage totals.
        "src/**/*.test.{js,jsx,ts,tsx}",
        "src/**/*.spec.{js,jsx,ts,tsx}",
        "src/**/__tests__/**",
        "src/test-utils/**",
        "src/widgets/widgets.js",
        "src/widgets/components.js",
        "src/skeleton/custom.js",
        "next-i18next.config.js",
        "next.config.js",
        "postcss.config.js",
        "tailwind.config.js",
        "eslint.config.mjs",
        "vitest.config.mjs",
        ".prettierrc.js",
      ],
    },
  },
});
