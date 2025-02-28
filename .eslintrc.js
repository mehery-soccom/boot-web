module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,  // ✅ Ensures ES6+ features are enabled
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021, // Ensure it supports ES2021 features (optional chaining)
    sourceType: "module",
    parser: "babel-eslint",
  },
  rules: {
    "no-unused-vars": "off",
    "no-useless-escape": "off",
    "no-redeclare": "off",
    "no-unreachable": "off",
    "no-mixed-spaces-and-tabs" : "off"
  },
};
