/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // TD-2: Detect 'any' types
    '@typescript-eslint/no-explicit-any': 'error',
    // TD-3: Detect placeholder tests
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='expect'] > Literal[value=true] ~ Identifier[name='toBe'] ~ Literal[value=true]",
        message: "Do not use expect(true).toBe(true). Write real assertions.",
      },
    ],
  },
}
