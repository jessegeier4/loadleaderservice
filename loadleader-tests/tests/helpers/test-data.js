// tests/helpers/test-data.js
// Centralized test data — shared across all test files
//
// IMPORTANT: These are TEST accounts.
// Create these accounts manually in your STAGING Firebase project before running tests.
// Never run these tests against production until you switch to a real staging environment.

export const TEST_PILOT = {
  email: process.env.TEST_PILOT_EMAIL || 'test-pilot@loadleadertest.com',
  password: process.env.TEST_PILOT_PASSWORD || 'TestPilot2026!',
  name: 'Test Pilot Dale',
  homeState: 'TX',
};

export const TEST_CARRIER = {
  email: process.env.TEST_CARRIER_EMAIL || 'test-carrier@loadleadertest.com',
  password: process.env.TEST_CARRIER_PASSWORD || 'TestCarrier2026!',
  companyName: 'Test Heavy Haul Co',
  contactName: 'Test Carrier Mike',
};

// A reusable load template for tests that need to post one
export const TEST_LOAD = {
  origin: 'CHICAGO, IL',
  destination: 'DENVER, CO',
  pickupDate: getDateInDays(7), // 7 days from now
  weight: '85000', // pounds
  length: '75',
  width: '14',
  height: '15',
  commodity: 'WIND TURBINE BLADE',
  pilotsNeeded: 2,
  payStructure: {
    dayRate: '500',
    mileageRate: '2.50',
    overnight: '150',
  },
  notes: 'Test load — please ignore. Created by automated test suite.',
};

// Helper: produces an ISO date string N days from now
function getDateInDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Test selectors — centralizes data-testid attributes
// If any of these change in the UI, update them here once.
export const SELECTORS = {
  // Auth
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  loginSubmit: '[data-testid="login-submit"]',
  signupLink: '[data-testid="signup-link"]',
  logoutBtn: '[data-testid="logout-btn"]',

  // Navigation
  navDashboard: '[data-testid="nav-dashboard"]',
  navLoads: '[data-testid="nav-loads"]',
  navMessages: '[data-testid="nav-messages"]',
  navProfile: '[data-testid="nav-profile"]',
  themeToggle: '[data-testid="theme-toggle"]',

  // Carrier — post load
  postLoadBtn: '[data-testid="post-load-btn"]',
  loadOrigin: '[data-testid="load-origin"]',
  loadDestination: '[data-testid="load-destination"]',
  loadPickupDate: '[data-testid="load-pickup-date"]',
  loadWeight: '[data-testid="load-weight"]',
  loadLength: '[data-testid="load-length"]',
  loadWidth: '[data-testid="load-width"]',
  loadHeight: '[data-testid="load-height"]',
  loadCommodity: '[data-testid="load-commodity"]',
  loadPilotsNeeded: '[data-testid="load-pilots-needed"]',
  loadDayRate: '[data-testid="pay-day-rate"]',
  loadMileageRate: '[data-testid="pay-mileage-rate"]',
  loadOvernightRate: '[data-testid="pay-overnight"]',
  loadNotes: '[data-testid="load-notes"]',
  loadSubmit: '[data-testid="load-submit"]',

  // Pilot — search and apply
  loadSearchInput: '[data-testid="load-search"]',
  loadCard: '[data-testid="load-card"]',
  loadCardApply: '[data-testid="load-card-apply"]',
  applyConfirmBtn: '[data-testid="apply-confirm"]',
  pilotCounter: '[data-testid="pilot-counter"]',
  fullBadge: '[data-testid="full-badge"]',

  // Carrier — accept applicant
  applicantCard: '[data-testid="applicant-card"]',
  acceptApplicantBtn: '[data-testid="accept-applicant"]',
  rejectApplicantBtn: '[data-testid="reject-applicant"]',

  // Cancel flow (Part C)
  cancelLoadBtn: '[data-testid="cancel-load"]',
  removePilotBtn: '[data-testid="remove-pilot"]',
  cancelReasonSelect: '[data-testid="cancel-reason"]',
  cancelConfirmBtn: '[data-testid="cancel-confirm"]',

  // Status
  loadStatus: '[data-testid="load-status"]',
  markDeliveredBtn: '[data-testid="mark-delivered"]',

  // Invoice
  invoiceCreateBtn: '[data-testid="invoice-create"]',
  invoiceDays: '[data-testid="invoice-days"]',
  invoiceMiles: '[data-testid="invoice-miles"]',
  invoiceOvernights: '[data-testid="invoice-overnights"]',
  invoiceTotal: '[data-testid="invoice-total"]',
  invoiceSubmit: '[data-testid="invoice-submit"]',

  // Notifications
  notificationBell: '[data-testid="notification-bell"]',
  notificationItem: '[data-testid="notification-item"]',
  unreadDot: '[data-testid="unread-dot"]',

  // Permits
  permitUploadInput: '[data-testid="permit-upload"]',
  permitViewBtn: '[data-testid="permit-view"]',
  permitDeleteBtn: '[data-testid="permit-delete"]',

  // Toasts
  toastSuccess: '[data-testid="toast-success"]',
  toastError: '[data-testid="toast-error"]',
};
