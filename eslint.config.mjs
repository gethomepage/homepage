import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],

    extends: fixupConfigRules(compat.extends("next/core-web-vitals", "prettier", "plugin:react-hooks/recommended")),

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

      // Keep the pre-eslint-plugin-react-hooks v6 lint policy until rules are adopted incrementally
      "react-hooks/config": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/gating": "off",
      "react-hooks/globals": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/static-components": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/use-memo": "off",
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
