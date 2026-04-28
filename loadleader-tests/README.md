# LoadLeader End-to-End Tests

Playwright test suite covering the five critical flows of LoadLeader:

1. **Authentication** — pilot login, carrier login, logout, session persistence (catches the carrier-redirect-to-pilot bug)
2. **Carrier posts a load** — full form including pay structure, validates pounds-not-tons, multi-pilot counter
3. **Pilot searches and applies** — finds open loads, applies, sees counter update
4. **Cancel and auto-reappear** — Part B/C logic — pilot cancels, carrier removes, load flips back to open
5. **Delivery and invoice** — full happy path from post to invoice generation

---

## Setup (one-time)

### 1. Install dependencies

```bash
cd loadleader-tests
npm install
npm run test:install
```

That installs Playwright and the browsers it needs.

### 2. Create staging Firebase project

**Critical:** Do not run these tests against your production Firebase. Create a separate Firebase project for testing — Firebase free tier is fine.

In your frontend code, add an environment-aware Firebase config:

```js
const firebaseConfig = window.location.hostname === 'staging.loadleaderservice.com'
  ? { /* staging config */ }
  : { /* production config */ };
```

Or run staging tests locally with Netlify Dev pointing at a staging branch.

### 3. Create test accounts

In your staging Firebase Auth, create two accounts manually:

- `test-pilot@loadleadertest.com` / `TestPilot2026!` (accountType: pilot)
- `test-carrier@loadleadertest.com` / `TestCarrier2026!` (accountType: carrier)

Or override via env vars:

```bash
export TEST_PILOT_EMAIL="your-test-pilot@..."
export TEST_PILOT_PASSWORD="..."
export TEST_CARRIER_EMAIL="..."
export TEST_CARRIER_PASSWORD="..."
```

### 4. Add `data-testid` attributes to your UI

This is the one-time effort that makes everything else work. Tests need stable selectors that don't break when you restyle. **Strings to find/replace in your `index.html` and JS:**

#### Login form

```html
<input type="email" data-testid="login-email" ...>
<input type="password" data-testid="login-password" ...>
<button data-testid="login-submit">Log In</button>
<a data-testid="signup-link">Sign up</a>
```

#### Navigation

```html
<button data-testid="nav-dashboard">Dashboard</button>
<button data-testid="nav-loads">Loads</button>
<button data-testid="nav-messages">Messages</button>
<button data-testid="nav-profile">Profile</button>
<button data-testid="theme-toggle">🌓</button>
<button data-testid="logout-btn">Log Out</button>
```

#### Carrier — post load form

```html
<button data-testid="post-load-btn">POST LOAD</button>
<input data-testid="load-origin" ...>
<input data-testid="load-destination" ...>
<input data-testid="load-pickup-date" type="date" ...>
<input data-testid="load-weight" type="number" ...>
<input data-testid="load-length" type="number" ...>
<input data-testid="load-width" type="number" ...>
<input data-testid="load-height" type="number" ...>
<input data-testid="load-commodity" ...>
<input data-testid="load-pilots-needed" type="number" min="1" max="4" ...>
<input data-testid="pay-day-rate" type="number" ...>
<input data-testid="pay-mileage-rate" type="number" step="0.01" ...>
<input data-testid="pay-overnight" type="number" ...>
<textarea data-testid="load-notes"></textarea>
<button data-testid="load-submit">POST LOAD</button>
```

#### Load card (rendered for each load)

```html
<div data-testid="load-card" data-load-id="${load.id}">
  <span data-testid="pilot-counter">2 OF 3 — 1 SPOT REMAINING</span>
  <span data-testid="full-badge">FULL</span>  <!-- only when full -->
  <span data-testid="load-status">accepted</span>
  <button data-testid="load-card-apply">APPLY NOW</button>
  <button data-testid="cancel-load">CANCEL</button>
  <button data-testid="remove-pilot">REMOVE</button>
  <button data-testid="mark-delivered">MARK DELIVERED</button>
  <button data-testid="invoice-create">CREATE INVOICE</button>
</div>
```

#### Apply / cancel modals

```html
<button data-testid="apply-confirm">CONFIRM APPLY</button>
<select data-testid="cancel-reason">
  <option value="">Select reason...</option>
  <option value="schedule">Schedule conflict</option>
  ...
</select>
<button data-testid="cancel-confirm">CONFIRM CANCEL</button>
```

#### Applicant card (carrier side)

```html
<div data-testid="applicant-card" data-pilot-id="${uid}">
  <button data-testid="accept-applicant">ACCEPT</button>
  <button data-testid="reject-applicant">REJECT</button>
</div>
```

#### Invoice form

```html
<input data-testid="invoice-days" type="number" ...>
<input data-testid="invoice-miles" type="number" ...>
<input data-testid="invoice-overnights" type="number" ...>
<span data-testid="invoice-total">$2,150</span>
<button data-testid="invoice-submit">SUBMIT INVOICE</button>
```

#### Notifications

```html
<button data-testid="notification-bell">🔔</button>
<div data-testid="notification-item" data-notif-id="...">...</div>
<span data-testid="unread-dot">•</span>
```

#### Toasts

```html
<div data-testid="toast-success">Load posted successfully</div>
<div data-testid="toast-error">Something went wrong</div>
```

---

## Running tests

```bash
# All tests, all browsers
npm test

# Visual mode (recommended first time — see what's happening)
npm run test:ui

# Single flow
npm run test:auth
npm run test:invoice

# View last test report
npm run test:report
```

By default tests run against `https://loadleaderservice.com`. To point at staging:

```bash
TEST_URL=https://staging.loadleaderservice.com npm test
```

---

## When tests fail

1. **Check the screenshot** — Playwright auto-saves failure screenshots under `playwright-report/`
2. **Run in headed mode** to watch what's happening: `npm run test:headed`
3. **Run in UI mode** for interactive debugging: `npm run test:ui`
4. Most failures are missing `data-testid` attributes — check the README's data-testid section above

---

## Adding new tests

1. Create a new file in `tests/` named like `06-feature-name.spec.js`
2. Import helpers from `tests/helpers/`
3. Add any new selectors to `tests/helpers/test-data.js`
4. Add the matching `data-testid` to your UI

---

## Future: continuous integration

Once tests are stable, hook them into Netlify or GitHub Actions:

```yaml
# .github/workflows/e2e.yml
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
        env:
          TEST_URL: ${{ secrets.STAGING_URL }}
```

Now every git push runs the full suite. If anything breaks, the PR can't merge.
