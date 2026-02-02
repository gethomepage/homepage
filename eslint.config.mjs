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
    },
  },
  globalIgnores(["./config/", "./.venv/", "./.next/", "./site/"]),
]);
