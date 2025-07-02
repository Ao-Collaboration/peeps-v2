module.exports = {
  semi: false,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: false,
  arrowParens: "avoid",
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["^react", "^@(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
