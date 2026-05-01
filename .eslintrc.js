module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: { attributes: false } },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  overrides: [
    {
      files: ["apps/marketing/**", "apps/dashboard/**"],
      env: { browser: true },
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
      ],
      plugins: ["react", "react-hooks"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
      },
      settings: {
        react: { version: "detect" },
      },
    },
    {
      files: ["packages/api/**"],
      rules: {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-useless-escape": "off",
        "@typescript-eslint/consistent-type-imports": "off",
      },
    },
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
      },
    },
  ],
  ignorePatterns: ["dist", "node_modules", ".turbo", "coverage"],
};
