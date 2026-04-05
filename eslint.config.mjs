import expoConfig from "eslint-config-expo/flat.js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**"],
  },
  ...expoConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  eslintConfigPrettier,
];
