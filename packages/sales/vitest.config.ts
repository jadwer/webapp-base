import { definePackageConfig } from '../../vitest.shared'
import path from 'path'

export default definePackageConfig({
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/'],
  },
  resolve: {
    alias: {
      '@lwm/ui': path.resolve(__dirname, '../ui/src'),
      '@lwm/auth': path.resolve(__dirname, '../auth/src'),
      '@lwm/products': path.resolve(__dirname, '../products/src'),
    },
  },
})
