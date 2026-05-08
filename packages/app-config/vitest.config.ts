import { definePackageConfig } from '../../vitest.shared'
import path from 'path'

export default definePackageConfig({
  test: {
    include: ['src/**/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/'],
  },
  resolve: {
    alias: {
      '@lwm/auth': path.resolve(__dirname, '../auth/src'),
    },
  },
})
