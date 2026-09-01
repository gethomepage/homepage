import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier/flat";
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...nextCoreWebVitals,
  prettierConfig,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],

    plugins: {
      prettier,
    },

    languageOptions: {
      ecmaVersion: 6,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
      },
    },

    settings: {
      "import/resolver": {
        node: {
          paths: ["src"],
        },
      },
    },

    rules: {
      "import/no-cycle": [
        "error",
        {
          maxDepth: 1,
        },
      ],

      "import/order": [
        "error",
        {
          "newlines-between": "always",
        },
      ],

      "no-else-return": [
        "error",
        {
          allowElseIf: true,
        },
      ],
    },
  },
  // Vitest tests often intentionally place imports after `vi.mock(...)` to ensure
  // modules under test see the mocked dependencies. `import/order` can't safely
  // auto-fix those cases, so disable it for test files.
  {
    files: ["src/**/*.test.{js,jsx}", "src/**/*.spec.{js,jsx}"],
    rules: {
      "import/order": "off",
    },
  },
  globalIgnores(["./config/", "./coverage/", "./.venv/", "./.next/", "./site/"]),
]);
