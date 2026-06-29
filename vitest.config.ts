import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})
