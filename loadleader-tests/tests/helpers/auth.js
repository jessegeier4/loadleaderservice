// tests/helpers/auth.js
// Reusable authentication actions
//
// These helpers wrap login/logout flows so individual tests stay focused on the
// flow being tested, not on auth setup.

import { SELECTORS, TEST_PILOT, TEST_CARRIER } from './test-data.js';

/**
 * Log in as a pilot. Returns once the pilot dashboard is visible.
 */
export async function loginAsPilot(page) {
  await page.goto('/');
  await page.fill(SELECTORS.loginEmail, TEST_PILOT.email);
  await page.fill(SELECTORS.loginPassword, TEST_PILOT.password);
  await page.click(SELECTORS.loginSubmit);

  // Wait for dashboard to confirm successful login
  await page.waitForSelector(SELECTORS.navDashboard, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Log in as a carrier. Returns once the carrier dashboard is visible.
 */
export async function loginAsCarrier(page) {
  await page.goto('/');
  await page.fill(SELECTORS.loginEmail, TEST_CARRIER.email);
  await page.fill(SELECTORS.loginPassword, TEST_CARRIER.password);
  await page.click(SELECTORS.loginSubmit);

  // Wait for the carrier-specific element (post load button)
  await page.waitForSelector(SELECTORS.postLoadBtn, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Log out of any account.
 */
export async function logout(page) {
  // Some apps hide logout in a profile menu — adjust if needed
  await page.click(SELECTORS.navProfile);
  await page.click(SELECTORS.logoutBtn);
  await page.waitForSelector(SELECTORS.loginSubmit, { timeout: 10_000 });
}

/**
 * Asserts the user is logged in (a logged-in-only element is visible).
 */
export async function expectLoggedIn(page) {
  await page.waitForSelector(SELECTORS.navDashboard, { timeout: 5_000 });
}

/**
 * Asserts the user is logged out (login form is visible).
 */
export async function expectLoggedOut(page) {
  await page.waitForSelector(SELECTORS.loginSubmit, { timeout: 5_000 });
}
