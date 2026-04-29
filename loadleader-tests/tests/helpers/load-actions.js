// tests/helpers/load-actions.js
// Reusable load-related actions

import { SELECTORS, TEST_LOAD } from './test-data.js';

/**
 * Post a new load as a logged-in carrier.
 * Returns the load ID (parsed from URL or page) for downstream tests to reference.
 *
 * @param {object} overrides - any fields from TEST_LOAD to override
 */
export async function postLoad(page, overrides = {}) {
  const load = { ...TEST_LOAD, ...overrides };

  await page.click(SELECTORS.postLoadBtn);

  // Fill the form
  await page.fill(SELECTORS.loadOrigin, load.origin);
  await page.fill(SELECTORS.loadDestination, load.destination);
  // pOriginState / pDestState are <select> elements with no testid — use the
  // raw IDs. Required fields per submitLoad validation, otherwise it rejects
  // with "Please fill in origin and destination" and never shows the toast.
  if (load.originState) await page.selectOption('#pOriginState', load.originState);
  if (load.destinationState) await page.selectOption('#pDestState', load.destinationState);
  await page.fill(SELECTORS.loadPickupDate, load.pickupDate);
  await page.fill(SELECTORS.loadWeight, load.weight);
  await page.fill(SELECTORS.loadLength, load.length);
  await page.fill(SELECTORS.loadWidth, load.width);
  await page.fill(SELECTORS.loadHeight, load.height);
  await page.fill(SELECTORS.loadCommodity, load.commodity);

  // pPilots is a <select> — use selectOption (page.fill does not work on selects).
  await page.selectOption(SELECTORS.loadPilotsNeeded, String(load.pilotsNeeded));

  // Pay structure
  if (load.payStructure?.dayRate) {
    await page.fill(SELECTORS.loadDayRate, load.payStructure.dayRate);
  }
  if (load.payStructure?.mileageRate) {
    await page.fill(SELECTORS.loadMileageRate, load.payStructure.mileageRate);
  }
  if (load.payStructure?.overnight) {
    await page.fill(SELECTORS.loadOvernightRate, load.payStructure.overnight);
  }

  await page.fill(SELECTORS.loadNotes, load.notes);
  await page.click(SELECTORS.loadSubmit);

  // Wait for success toast or redirect
  await page.waitForSelector(SELECTORS.toastSuccess, { timeout: 15_000 });

  // submitLoad calls loadApplications() but stays on the postload panel.
  // Navigate to My Loads so the new card is in a visible panel — both for the
  // helper's getAttribute below and for the calling test's toBeVisible check.
  await page.click(SELECTORS.navLoads);
  await page.waitForSelector(SELECTORS.loadCard, { timeout: 15_000 });

  // Return the most recently posted load — first card on dashboard
  const firstCard = page.locator(SELECTORS.loadCard).first();
  return await firstCard.getAttribute('data-load-id');
}

/**
 * Find a specific load card by its data-load-id.
 */
export function loadCardById(page, loadId) {
  return page.locator(`${SELECTORS.loadCard}[data-load-id="${loadId}"]`);
}

/**
 * Apply to a load as a logged-in pilot.
 */
export async function applyToLoad(page, loadId) {
  const card = loadCardById(page, loadId);
  await card.locator(SELECTORS.loadCardApply).click();

  // Confirm in modal/dialog
  await page.click(SELECTORS.applyConfirmBtn);
  await page.waitForSelector(SELECTORS.toastSuccess, { timeout: 10_000 });
}

/**
 * Read the pilot counter text on a load card.
 * Returns null if no counter (single-pilot load).
 */
export async function getPilotCounterText(page, loadId) {
  const card = loadCardById(page, loadId);
  const counter = card.locator(SELECTORS.pilotCounter);
  if (await counter.count() === 0) return null;
  return (await counter.textContent())?.trim();
}

/**
 * Check whether a load card shows the FULL badge.
 */
export async function isLoadFull(page, loadId) {
  const card = loadCardById(page, loadId);
  return (await card.locator(SELECTORS.fullBadge).count()) > 0;
}
