import { definePackageConfig } from '../../vitest.shared'

export default definePackageConfig({
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/'],
  },
})
