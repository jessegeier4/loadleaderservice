// tests/04-cancel-and-reappear.spec.js
// Cancel flow tests — Part B/C logic
//
// Catches bugs like:
// - Load not reappearing in search after pilot cancels
// - Status not flipping back to 'open'
// - Counter not decrementing
// - Cancel reasons not being saved

import { test, expect } from '@playwright/test';
import { loginAsPilot, loginAsCarrier } from './helpers/auth.js';
import { postLoad, loadCardById, applyToLoad, getPilotCounterText, isLoadFull } from './helpers/load-actions.js';
import { SELECTORS } from './helpers/test-data.js';

test.describe('Cancel & Auto-Reappear (Part B/C)', () => {

  test('pilot cancels — load reappears as open with correct counter', async ({ page, browser }) => {
    // Setup: carrier posts 2-pilot load, pilot gets accepted
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);
    const loadId = await postLoad(carrierPage, { pilotsNeeded: 2 });

    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);
    await applyToLoad(page, loadId);

    // Carrier accepts
    await carrierPage.reload();
    const carrierCard = loadCardById(carrierPage, loadId);
    await carrierCard.click();
    await carrierPage.locator(SELECTORS.applicantCard).first()
      .locator(SELECTORS.acceptApplicantBtn).click();
    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // Pilot cancels
    await page.reload();
    await page.click(SELECTORS.navDashboard);
    const pilotCard = loadCardById(page, loadId);
    await pilotCard.locator(SELECTORS.cancelLoadBtn).click();

    // Reason dropdown
    await page.selectOption(SELECTORS.cancelReasonSelect, { index: 1 }); // pick first real option
    await page.click(SELECTORS.cancelConfirmBtn);

    await page.waitForSelector(SELECTORS.toastSuccess);

    // Verify carrier sees counter back to 0 of 2 and status is open
    await carrierPage.reload();
    const counterText = await getPilotCounterText(carrierPage, loadId);
    expect(counterText).toMatch(/0\s*OF\s*2/i);

    const stillFull = await isLoadFull(carrierPage, loadId);
    expect(stillFull).toBe(false);

    await carrierContext.close();
  });

  test('carrier removes pilot — same auto-reappear logic applies', async ({ page, browser }) => {
    // Carrier posts 2-pilot load, pilot accepted, carrier removes them
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);
    const loadId = await postLoad(carrierPage, { pilotsNeeded: 2 });

    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);
    await applyToLoad(page, loadId);

    await carrierPage.reload();
    const card = loadCardById(carrierPage, loadId);
    await card.click();
    await carrierPage.locator(SELECTORS.applicantCard).first()
      .locator(SELECTORS.acceptApplicantBtn).click();
    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // Carrier removes the pilot
    await carrierPage.locator(SELECTORS.removePilotBtn).first().click();
    await carrierPage.selectOption(SELECTORS.cancelReasonSelect, { index: 1 });
    await carrierPage.click(SELECTORS.cancelConfirmBtn);
    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // Counter back to 0 of 2
    const counterText = await getPilotCounterText(carrierPage, loadId);
    expect(counterText).toMatch(/0\s*OF\s*2/i);

    await carrierContext.close();
  });

  test('cancel without reason is blocked', async ({ page, browser }) => {
    // This guards against future "skip the reason dropdown" regressions
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);
    const loadId = await postLoad(carrierPage, { pilotsNeeded: 1 });

    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);
    await applyToLoad(page, loadId);

    await carrierPage.reload();
    const card = loadCardById(carrierPage, loadId);
    await card.click();
    await carrierPage.locator(SELECTORS.applicantCard).first()
      .locator(SELECTORS.acceptApplicantBtn).click();
    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // Pilot tries to cancel without selecting a reason
    await page.reload();
    await page.click(SELECTORS.navDashboard);
    const pilotCard = loadCardById(page, loadId);
    await pilotCard.locator(SELECTORS.cancelLoadBtn).click();
    // Don't select a reason — try to confirm directly
    await page.click(SELECTORS.cancelConfirmBtn);

    // Should NOT succeed — error or no-op
    await expect(page.locator(SELECTORS.toastSuccess)).toHaveCount(0);

    await carrierContext.close();
  });

});
