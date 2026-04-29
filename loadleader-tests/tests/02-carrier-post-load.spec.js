// tests/02-carrier-post-load.spec.js
// Carrier post-load flow tests
//
// Catches bugs like:
// - Pay structure not saving correctly
// - Weight defaulting to wrong unit
// - pilotsNeeded field not being recorded
// - Form validation failing silently

import { test, expect } from '@playwright/test';
import { loginAsCarrier } from './helpers/auth.js';
import { postLoad, loadCardById } from './helpers/load-actions.js';
import { SELECTORS, TEST_LOAD } from './helpers/test-data.js';

test.describe('Carrier — Post Load', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCarrier(page);
  });

  test('carrier can post a load with full pay structure', async ({ page }) => {
    const loadId = await postLoad(page);
    expect(loadId).toBeTruthy();

    // Load should appear on dashboard with correct details
    const card = loadCardById(page, loadId);
    await expect(card).toBeVisible();
    await expect(card).toContainText(TEST_LOAD.origin);
    await expect(card).toContainText(TEST_LOAD.destination);
    await expect(card).toContainText(TEST_LOAD.commodity);
  });

  // SKIPPED: pilot counter UI ("0 OF 3 — 3 SPOTS REMAINING") not yet built.
  test.skip('multi-pilot load shows correct counter immediately', async ({ page }) => {
    // Post a load needing 3 pilots
    const loadId = await postLoad(page, { pilotsNeeded: 3 });
    const card = loadCardById(page, loadId);

    // Counter should show 0 of 3 — 3 spots remaining
    const counter = card.locator(SELECTORS.pilotCounter);
    await expect(counter).toBeVisible();
    await expect(counter).toContainText(/0\s*OF\s*3/i);
    await expect(counter).toContainText(/3\s*SPOT/i);
  });

  // SKIPPED: pilot counter UI not yet built.
  test.skip('single-pilot load does NOT show counter (Part B logic)', async ({ page }) => {
    const loadId = await postLoad(page, { pilotsNeeded: 1 });
    const card = loadCardById(page, loadId);

    // Counter should be hidden for single-pilot loads
    await expect(card.locator(SELECTORS.pilotCounter)).toHaveCount(0);
  });

  test('weight is treated as pounds, not tons', async ({ page }) => {
    // Post a load with 85,000 — should display as pounds, not be misinterpreted as tons
    const loadId = await postLoad(page, { weight: '85000' });
    const card = loadCardById(page, loadId);

    // Should see "85,000" or similar — NOT "85 tons" or "170,000"
    await expect(card).toContainText(/85[,\s]*000/);
    await expect(card).not.toContainText(/170[,\s]*000/);
  });

  test('form validation rejects empty required fields', async ({ page }) => {
    await page.click(SELECTORS.postLoadBtn);
    // Submit with nothing filled
    await page.click(SELECTORS.loadSubmit);

    // Should NOT see success toast — should see error or stay on form
    await expect(page.locator(SELECTORS.toastSuccess)).toHaveCount(0);
    // Either an error toast appears, or the origin field gets browser-native :invalid styling
    const originField = page.locator(SELECTORS.loadOrigin);
    await expect(originField).toBeFocused().catch(() => {
      // If browser doesn't auto-focus invalid field, check for error toast
      return expect(page.locator(SELECTORS.toastError)).toBeVisible();
    });
  });

});
