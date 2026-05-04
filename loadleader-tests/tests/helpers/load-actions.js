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

  // Get the just-posted load id deterministically. submitLoad sets
  // window._lastPostedLoadId = ref.id after addDoc, BUT only on builds that
  // include the latest carrier-dashboard.html. To handle staging deploys that
  // are behind main, fall back to querying Firestore directly for the most
  // recent postedAt by the current carrier — which works against any version
  // of the page as long as Firebase is initialized (which it is, since we
  // just used the same SDK to post the load).
  const loadId = await page.evaluate(async () => {
    if (window._lastPostedLoadId) return window._lastPostedLoadId;
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const db = getFirestore(getApp());
    const uid = getAuth(getApp()).currentUser?.uid;
    if (!uid) return null;
    const snap = await getDocs(query(collection(db, 'loads'), where('carrierId', '==', uid)));
    let newestId = null, newestMs = 0;
    snap.forEach(d => {
      const ms = d.data().postedAt?.toMillis?.() || 0;
      if (ms > newestMs) { newestMs = ms; newestId = d.id; }
    });
    return newestId;
  });
  if (!loadId) throw new Error('postLoad: could not determine just-posted loadId from Firestore or window._lastPostedLoadId');

  // Navigate to My Loads so the new card is in a visible panel — both for the
  // calling test's toBeVisible check and any follow-up locator queries.
  await page.click(SELECTORS.navLoads);

  // Wait for the specific card we just posted to be visible. The carrier
  // dashboard renders the same card in #panel-myloads (visible) AND
  // #panel-overview (hidden after this click) — the :visible filter scopes to
  // the active panel.
  await page.waitForSelector(`${SELECTORS.loadCard}[data-load-id="${loadId}"]:visible`, { timeout: 15_000 });
  return loadId;
}

/**
 * Find a specific load card by its data-load-id. Scoped to visible only because
 * the carrier dashboard duplicates cards across overview + myloads panels.
 */
export function loadCardById(page, loadId) {
  return page.locator(`${SELECTORS.loadCard}[data-load-id="${loadId}"]:visible`);
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
