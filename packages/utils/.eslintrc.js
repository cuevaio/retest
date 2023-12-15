/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@retestlabs/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
};
