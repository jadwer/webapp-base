import { definePackageConfig } from '../../vitest.shared'

export default definePackageConfig({
  test: {
    include: ['src/**/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/'],
  },
})
