import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/pizza-per-inch/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // main.tsx only starts the app, and is exempt from tests (see docs/conventions.md).
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A little below what the tests reach today, so a drop is caught without small changes
      // failing the build. Raise them when coverage rises.
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
    },
  },
})
