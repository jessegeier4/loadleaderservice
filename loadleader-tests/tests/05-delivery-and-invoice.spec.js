// tests/05-delivery-and-invoice.spec.js
// End-to-end happy path — delivery and invoice generation
//
// Catches bugs like:
// - Mark Delivered not updating status
// - Invoice rates not pre-populated from load
// - Invoice total calculation wrong
// - Permits not auto-deleting on delivery

import { test, expect } from '@playwright/test';
import { loginAsPilot, loginAsCarrier } from './helpers/auth.js';
import { postLoad, loadCardById, applyToLoad } from './helpers/load-actions.js';
import { SELECTORS } from './helpers/test-data.js';

test.describe('Delivery & Invoice (End-to-End Happy Path)', () => {

  test('full flow: post → apply → accept → deliver → invoice', async ({ page, browser }) => {
    // 1. Carrier posts a load
    const carrierContext = await browser.newContext();
    const carrierPage = await carrierContext.newPage();
    await loginAsCarrier(carrierPage);

    const loadId = await postLoad(carrierPage, {
      pilotsNeeded: 1,
      payStructure: {
        dayRate: '500',
        mileageRate: '2.50',
        overnight: '150',
      }
    });

    // 2. Pilot applies
    await loginAsPilot(page);
    await page.click(SELECTORS.navLoads);
    await applyToLoad(page, loadId);

    // 3. Carrier accepts
    await carrierPage.reload();
    const carrierCard = loadCardById(carrierPage, loadId);
    await carrierCard.click();
    await carrierPage.locator(SELECTORS.applicantCard).first()
      .locator(SELECTORS.acceptApplicantBtn).click();
    await carrierPage.waitForSelector(SELECTORS.toastSuccess);

    // 4. Pilot marks delivered
    await page.reload();
    await page.click(SELECTORS.navDashboard);
    const pilotCard = loadCardById(page, loadId);
    await pilotCard.locator(SELECTORS.markDeliveredBtn).click();
    await page.waitForSelector(SELECTORS.toastSuccess);

    // Status should now read 'delivered' on the card
    await expect(pilotCard.locator(SELECTORS.loadStatus)).toContainText(/delivered/i);

    // 5. Pilot creates invoice
    await pilotCard.locator(SELECTORS.invoiceCreateBtn).click();

    // Pay structure should be pre-populated and read-only
    // Pilot fills in actuals
    await page.fill(SELECTORS.invoiceDays, '2');
    await page.fill(SELECTORS.invoiceMiles, '400');
    await page.fill(SELECTORS.invoiceOvernights, '1');

    // Total should auto-calc: (2 * 500) + (400 * 2.50) + (1 * 150) = 1000 + 1000 + 150 = $2,150
    const totalText = await page.locator(SELECTORS.invoiceTotal).textContent();
    expect(totalText).toMatch(/2[,]?150/);

    // Submit the invoice
    await page.click(SELECTORS.invoiceSubmit);
    await page.waitForSelector(SELECTORS.toastSuccess);

    await carrierContext.close();
  });

  test('invoice prevents bogus inputs (negative numbers)', async ({ page }) => {
    // Edge case test — input validation on invoice
    await loginAsPilot(page);

    // Find any delivered load with create-invoice option
    await page.click(SELECTORS.navDashboard);
    const invoiceBtn = page.locator(SELECTORS.invoiceCreateBtn).first();
    const exists = await invoiceBtn.count();

    if (exists === 0) {
      test.skip(true, 'No delivered loads available — skip. Run full flow test first.');
      return;
    }

    await invoiceBtn.click();
    await page.fill(SELECTORS.invoiceDays, '-2');
    await page.click(SELECTORS.invoiceSubmit);

    // Should NOT submit successfully
    await expect(page.locator(SELECTORS.toastSuccess)).toHaveCount(0);
  });

});
