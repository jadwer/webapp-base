/// <reference types="vitest" />

import { defineConfig, mergeConfig, type UserConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Shared vitest config for `@lwm/*` packages.
 *
 * Each package extends this in its own `vitest.config.ts` and adds path
 * aliases / setup files specific to its source layout. Tests live next to
 * the source they cover (`packages/<name>/src/tests/`) and mock internal
 * modules via path-relative `vi.mock('../lib/foo')`, never via the package
 * barrel — that way `vi.mocked(foo)` resolves to the same instance the SUT
 * actually imports.
 *
 * The template (`apps/template`) keeps its own vitest config for app-level
 * integration tests; package tests are intentionally NOT included there to
 * avoid double-running.
 */
export const sharedConfig: UserConfig = defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    watch: false,
    retry: 1,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
  },
})

/**
 * Helper for packages: extend the shared config with package-specific
 * setup files, aliases, etc.
 *
 * Usage in `packages/<name>/vitest.config.ts`:
 *
 *   import { definePackageConfig } from '../../vitest.shared'
 *   export default definePackageConfig({
 *     test: { setupFiles: ['./src/tests/setup.ts'] },
 *     resolve: { alias: { ... } },
 *   })
 */
export function definePackageConfig(overrides: UserConfig): UserConfig {
  return mergeConfig(sharedConfig, defineConfig(overrides))
}
