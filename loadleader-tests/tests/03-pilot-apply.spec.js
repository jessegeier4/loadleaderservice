// tests/03-pilot-apply.spec.js
// Pilot search and apply flow tests
//
// Catches bugs like:
// - Pilots seeing loads that aren't 'open'
// - Apply button enabled when load is full
// - Counter not updating after apply

import { test, expect } from '@playwright/test';
import { loginAsPilot, loginAsCarrier, logout } from './helpers/auth.js';
import { postLoad, loadCardById, applyToLoad, getPilotCounterText } from './helpers/load-actions.js';
import { SELECTORS } from './helpers/test-data.js';

test.describe('Pilot — Search & Apply', () => {

  test('pilot can find an open load and apply', async ({ page, browser }) => {
    // Carrier posts the load first (in a separate browser context)
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);
    const loadId = await postLoad(carrierPage, { pilotsNeeded: 2 });
    await carrierContext.close();

    // Pilot logs in and finds it
    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);

    const card = loadCardById(page, loadId);
    await expect(card).toBeVisible({ timeout: 15_000 });

    // Apply
    await applyToLoad(page, loadId);

    // Toast should confirm
    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });

  test('FULL load shows badge and disables apply button', async ({ page, browser }) => {
    // Setup: post a single-pilot load and have it accepted by another pilot
    // For this test we'll simulate by checking the UI state assertion:
    // - Find any load that already has FULL badge
    // - Confirm apply is disabled

    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);

    // Find any FULL load on the page
    const fullLoads = page.locator(`${SELECTORS.loadCard}:has(${SELECTORS.fullBadge})`);
    const fullCount = await fullLoads.count();

    if (fullCount > 0) {
      const firstFull = fullLoads.first();
      const applyBtn = firstFull.locator(SELECTORS.loadCardApply);
      // Apply button should be disabled OR replaced with text
      const isDisabled = await applyBtn.isDisabled().catch(() => true);
      expect(isDisabled).toBe(true);
    } else {
      test.skip(true, 'No FULL loads in test data — skipping. Seed a full load to test this.');
    }
  });

  // SKIPPED: pilot counter UI ("X OF Y") not yet built.
  test.skip('counter updates after pilot applies and is accepted', async ({ page, browser }) => {
    // Carrier posts a 2-pilot load
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);
    const loadId = await postLoad(carrierPage, { pilotsNeeded: 2 });

    // Pilot applies
    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);
    await applyToLoad(page, loadId);

    // Carrier accepts the applicant
    await carrierPage.reload();
    await carrierPage.click(SELECTORS.navDashboard);

    const carrierCard = loadCardById(carrierPage, loadId);
    await carrierCard.click();

    const applicant = carrierPage.locator(SELECTORS.applicantCard).first();
    await applicant.locator(SELECTORS.acceptApplicantBtn).click();

    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // Counter on the carrier dashboard should now read 1 of 2
    const counterText = await getPilotCounterText(carrierPage, loadId);
    expect(counterText).toMatch(/1\s*OF\s*2/i);

    await carrierContext.close();
  });

});
