export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/.agents/**", "**/.claude/**"]
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];