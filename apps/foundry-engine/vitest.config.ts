import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use standard Vitest for unit tests with mocked dependencies
    // Workers AI and R2 bindings are mocked at the function level
    include: ['src/**/*.test.ts'],
    // Exclude tests that require Workers pool (Durable Objects tests)
    exclude: ['src/durable-objects/**/*.test.ts', 'node_modules/**'],
    environment: 'node',
  },
})
