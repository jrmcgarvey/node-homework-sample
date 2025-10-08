const { defineConfig } = require("eslint/config");
const js = require("@eslint/js");
const globals = require("globals");

module.exports = defineConfig([
  {
    files: ["**/*.{mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.js"],
    ignores: ["./tdd/**/*.js", "./test/**/*.js", "./load-db.js"],
    languageOptions: {sourceType: "commonjs", globals: {...globals.node}},
    plugins: {js},
    extends: ["js/recommended"],
    rules: {
      "quotes": ["error", "double"],
      "indent": ["error", 2, {"SwitchCase": 1}],
      "semi": ["error", "always"],
    },
  },
  {
    files: ["**/*.{mjs,cjs}"],
    languageOptions: { globals: globals.browser },
  },
]);
