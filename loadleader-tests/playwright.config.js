// playwright.config.js
// LoadLeader end-to-end test configuration
//
// Run all tests:        npx playwright test
// Run one file:         npx playwright test tests/01-pilot-signup.spec.js
// Run with UI mode:     npx playwright test --ui
// Run headed (visible): npx playwright test --headed
// Show last report:     npx playwright show-report

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you left test.only in source
  forbidOnly: !!process.env.CI,
  // No retries on CI yet — gives us fast feedback on real failures while we
  // stabilize. Bump to 1-2 once tests are reliably green.
  retries: 0,
  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    // Override with TEST_URL env var to point at staging or production.
    baseURL: process.env.TEST_URL || 'https://loadleaderservice.com',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Default timeout for actions
    actionTimeout: 10_000,

    // Default timeout for navigation
    navigationTimeout: 15_000,
  },

  // Configure projects for major browsers.
  // mobile-safari (webkit) disabled while we stabilize — doubles run time and adds
  // iOS-specific quirks not worth debugging at this stage. Re-enable when chromium
  // is reliably green.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 13'] },
    // },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});
