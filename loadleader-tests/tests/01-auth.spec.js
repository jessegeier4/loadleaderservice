// tests/01-auth.spec.js
// Authentication flow tests
//
// Catches bugs like:
// - Carrier login redirecting to pilot dashboard (from your bug history)
// - Wrong credentials silently failing
// - Logout not actually clearing session

import { test, expect } from '@playwright/test';
import { loginAsPilot, loginAsCarrier, logout, expectLoggedIn, expectLoggedOut } from './helpers/auth.js';
import { SELECTORS, TEST_PILOT, TEST_CARRIER } from './helpers/test-data.js';

test.describe('Authentication', () => {

  test('pilot can log in and reaches pilot dashboard', async ({ page }) => {
    await loginAsPilot(page);
    await expectLoggedIn(page);

    // Pilot-specific element should be visible — load search
    await expect(page.locator(SELECTORS.loadSearchInput)).toBeVisible();

    // Should NOT see carrier-only "Post Load" button
    await expect(page.locator(SELECTORS.postLoadBtn)).toHaveCount(0);
  });

  test('carrier can log in and reaches carrier dashboard (NOT pilot dashboard)', async ({ page }) => {
    // This test specifically guards against the carrier-redirect-to-pilot bug
    await loginAsCarrier(page);

    // Carrier-only element MUST be visible
    await expect(page.locator(SELECTORS.postLoadBtn)).toBeVisible();

    // Pilot-only element should NOT appear
    await expect(page.locator(SELECTORS.loadSearchInput)).toHaveCount(0);
  });

  test('wrong password shows error and does not log in', async ({ page }) => {
    await page.goto('/');
    await page.fill(SELECTORS.loginEmail, TEST_PILOT.email);
    await page.fill(SELECTORS.loginPassword, 'wrongpassword123');
    await page.click(SELECTORS.loginSubmit);

    // Should see an error toast OR remain on login screen
    await expect(page.locator(SELECTORS.toastError)).toBeVisible({ timeout: 5000 });
    await expectLoggedOut(page);
  });

  test('logout clears session', async ({ page }) => {
    await loginAsPilot(page);
    await logout(page);
    await expectLoggedOut(page);

    // Try to navigate to a protected route — should redirect to login
    await page.goto('/dashboard');
    await page.waitForSelector(SELECTORS.loginSubmit, { timeout: 10_000 });
  });

  test('refreshing page keeps user logged in', async ({ page }) => {
    await loginAsPilot(page);
    await page.reload();
    await expectLoggedIn(page);
  });

});
