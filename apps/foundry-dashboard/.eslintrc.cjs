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
    // TD-2: Detect 'any' types - error in production code
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
  // TD-2: Relax 'any' rule to warn in test files and test utils (fix over time)
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.integration.test.ts',
        '**/__tests__/utils.ts',
        '**/__tests__/integration-harness.ts',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
}
