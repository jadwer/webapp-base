import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * For testing ERP demo happy paths
 *
 * USAGE: Run frontend first with `npm run dev`, then run `npm run test:e2e`
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
