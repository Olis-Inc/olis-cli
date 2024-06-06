import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({});

export default [
  ...compat.extends(
    "airbnb-base",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ),
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint", "prettier"],
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    ignorePatterns: ["node_modules", "dist"],
  }),
  {
    rules: {
      "prettier/prettier": ["error"],
      "import/no-extraneous-dependencies": "off",
      "no-restricted-syntax": "off",
      "no-shadow": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
    },
  },
];
