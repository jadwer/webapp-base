import { definePackageConfig } from '../../vitest.shared'
import path from 'path'

export default definePackageConfig({
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    include: [
      'src/tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules/', 'dist/'],
  },
  resolve: {
    alias: {
      // Internal alias so package tests can import the SUT exactly the way
      // production code does (relative paths). Mocks target relative paths,
      // not the @lwm/auth barrel — that is the whole point of moving tests
      // inside the package.
      '@lwm/ui': path.resolve(__dirname, '../ui/src'),
    },
  },
})
