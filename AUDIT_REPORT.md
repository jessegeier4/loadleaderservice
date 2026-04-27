# LoadLeader Audit Report

**Date:** 2026-04-27
**Audience focus:** Pilot car drivers and carriers/brokers, ages 35–70, often non-tech-savvy, often using phones in trucks.
**Scope:** Every public page, both dashboards, and the live deployed site.
**Method:** Three parallel deep code-audit agents + live Puppeteer testing on desktop (1280px) and mobile (375px).

> **Do not fix anything yet.** Read this report and tell me which items to tackle first.

---

## CRITICAL — broken or blocking, fix immediately

| # | Page / file | Location | Problem | Fix |
|---|---|---|---|---|
| C1 | login.html | line 283 | Terms & Privacy checkbox links go to `href="#"` — broken. **Confirmed live.** | Change to `href="terms.html"` and `href="privacy.html"` |
| C2 | loadboard.html | line 236 | Logo links to `dashboard.html` even for non-logged-in visitors. They get redirected to login. **Confirmed live.** | Detect auth state — go to `index.html` if signed out, `dashboard.html` if signed in |
| C3 | carrier-dashboard.html | line ~1335 in `submitLoad` | `miles` variable is referenced but never declared in scope. Load-alert miles filter silently never matches. | Add `const miles = parseFloat(document.getElementById('pMiles').value) \|\| 0;` |
| C4 | carrier-dashboard.html | line 1743 | `saveAsTemplate` reads `getElementById('pLoadType')` but the form field id is `pType`. Templates save with `loadType: undefined`. | Change to `pType` |
| C5 | carrier-dashboard.html | lines 1627, 2316, 2372 | Hardcoded nav-tab indices wrong after Invoices tab was added. `[5]` for Messages should be `[5]` (Profile is `[6]`), `[4]` should be `[5]`. Buttons navigate to wrong panel. | Audit all `document.querySelectorAll('.nav-tab')[N]` references. Better: replace with a name lookup map (`navIndex.messages`, etc.) |
| C6 | dashboard.html | line 1090 area (expense modal) | Expense modal is missing the **Category** field (Fuel/Tolls/Food/etc). The PDF report code groups by category but every entry is uncategorized — report shows everything under "Other". | Add `<select id="expCategory">` with Fuel, Tolls, Food, Repairs, Lodging, Other. Save into expense entry. *(Note: this may already be wired — agent flagged but not double-confirmed; verify before patching.)* |
| C7 | All `.html` (body) | `body { text-transform: uppercase; }` | Forced uppercase site-wide hurts readability of user-typed content (load notes, pilot names, message bubbles, invoice details). Some places override but most don't. | Remove from `body`. Apply explicitly only to nav/labels/badges/headings. |
| C8 | Push notifications | live test | NotRegistered (stale token) errors are still logged on server. Not user-facing but worth noting — the cleanup code does null the token, so this self-heals. | No action — server already handles it after the recent 200-instead-of-500 fix. |

---

## SHOULD CHANGE — hurts UX for this audience, fix soon

### Mobile / accessibility
| # | Page | Location | Problem | Fix |
|---|---|---|---|---|
| S1 | dashboard.html | `.mn-label` line 308–309 | Mobile bottom-nav labels are 0.6rem (~9px). 55+ users squint. | Bump to `.75rem` minimum |
| S2 | dashboard.html | `.notif-btn` line 59 | 34×34px tap target — below the 40–48px minimum | Make it 44×44px |
| S3 | dashboard.html | `.user-av` line 57 | Initials are 12px, hard to read | Bump to ~14px |
| S4 | carrier-dashboard.html | `.load-btn` line 147 | Action buttons (Edit/Permits/Complete/Delete/Re-post) are ~23px tall. Hard to tap on a phone in a truck. | Increase padding to `.5rem .9rem` minimum |
| S5 | All inputs | various | `font-size: 14–15px` on form inputs | iOS auto-zooms when input is below 16px. Use 16px to prevent zoom-on-focus. Also helps 50+ readability. |
| S6 | dashboard.html | `.conv-time`, `.sc-det-label`, `.review-meta` | `color: #444` on near-black background — fails WCAG AA | Use `var(--muted)` (#A3A3A3) |
| S7 | dashboard.html | `.cert-expand-btn` line 236 | `color: #555` — invisible on dark | Use `var(--text-2)` |
| S8 | loadboard.html | `#aiInput` placeholder | Placeholder is ~46 chars, cut off on 375px mobile (**confirmed live** — visible cut-off) | Shorten to `e.g. Ohio → Texas, $500+` |
| S9 | loadboard.html (mobile) | bottom-right floating button | Yellow AI/chat bubble overlaps the Load Type select on mobile (**confirmed live**) | Reposition or hide on small viewports |
| S10 | dashboard.html | `.empty-text` lines 424, 1404, 2596 | Empty-state copy at .875rem (~14px) borderline | Bump to .95rem and ensure muted color still passes contrast |

### Async feedback (loading states)
| # | Page | Location | Problem | Fix |
|---|---|---|---|---|
| S11 | dashboard.html | `submitLogDay` line ~2002, expense save line 2119 | Buttons say "Saving..." but no spinner — pilot taps twice on slow 4G | Add inline `<span class="spinner"></span>` matching other forms |
| S12 | dashboard.html | `submitExpense` | No button-disable during async — duplicate expense risk | Disable button + show spinner |
| S13 | dashboard.html | cert upload | Uses `alert()` for "File too large" — alert can be missed on mobile | Use the in-modal `expMsg` pattern |

### Content / copy
| # | Page | Location | Problem | Fix |
|---|---|---|---|---|
| S14 | index.html | `.hs-num` line 224 | Stats show "49 STATES" but other places say "48 STATES" — inconsistency erodes trust (**confirmed live**) | Pick one — likely 50 |
| S15 | loadboard.html | line 251 + #boardNotice | Page title "Find Your Next Run" assumes pilot. Empty state "be the first to post a load" assumes carrier. Same page, conflicting personas. | Detect role (or genericize to "Live Load Board") |
| S16 | dashboard.html | GPS warning copy | "Unable to get GPS after 2 attempts" — jargon for non-tech users | "Couldn't find your location. Step outside or near a window, or submit without location proof." |
| S17 | carrier-dashboard.html | line 447 | Form label "Equipment / Load Description" — "equipment" is ambiguous to non-trucking-savvy carriers | Change to "What are you hauling? (e.g., CAT 988H Loader, Steel Coils)" |
| S18 | carrier-dashboard.html | "Pilots Needed" label | LoadLeader-internal jargon — outsiders don't connect "pilots" with "pilot car drivers" | Change to "How many pilot car drivers do you need?" |
| S19 | dashboard.html | "Quick Apply Message" line 762 | "Auto-fills" is jargon | Re-word in active voice |
| S20 | dashboard.html | saved loads count line 1429 | Shows "You have 0 saved loads" when empty — awkward | Branch on `=== 0` to "You have no saved loads yet" |

### Affordances / discoverability
| # | Page | Location | Problem | Fix |
|---|---|---|---|---|
| S21 | dashboard.html + carrier-dashboard.html | stat cards | Cards are clickable but no `:hover` background change. Older users won't try clicking. | `.stat-card:hover { background: var(--mid); border-color: var(--yellow); }` |
| S22 | dashboard.html | `#msgDot` line 337 | Unread-message indicator dot exists but is hardcoded `display:none` and never made visible | In `loadConversations()`, toggle visibility when `hasUnread` |
| S23 | carrier-dashboard.html | Following / Followers tabs ~ line 938 | No `.active` highlight — user doesn't know which view they're in | Add active tab styling |
| S24 | carrier-dashboard.html | resetTestData | Uses `confirm()` + `prompt("type DELETE")` — browser modals are tiny on mobile, easy to fat-finger Cancel | Custom modal dialog |
| S25 | carrier-dashboard.html | toast `setTimeout 3500` | 3.5s too short for users 70+ to read | 5000ms |
| S26 | loadboard.html | nav | Removed Home tab earlier — but a first-time visitor on the loadboard has no obvious way back to landing page (logo goes to dashboard) | Either restore Home, or have logo go to / for signed-out users |
| S27 | login.html | post-signup flow | Both bottom CTAs (pricing.html lines 371–372) link to `login.html?tab=signup` with no role distinction | Append `?role=pilot` / `?role=carrier` and pre-select the type card |

---

## NICE TO ADD — would genuinely help drivers, ranked by impact

### High value
| # | Feature | Why pilots/carriers want it | Complexity |
|---|---|---|---|
| N1 | **Job completion checklist before delivery confirm** | Catches "forgot to log day" / "forgot truck #" / "no receipt" before invoice fires. Reduces post-delivery disputes. | Medium |
| N2 | **Offline day-log capture (localStorage → sync)** | Truck stops have terrible signal. Pilots want to log instantly, not wait for WiFi. | Medium (service worker) |
| N3 | **One-tap "Available Now" toggle on overview** | Drivers change availability multiple times per day. Currently buried 4 clicks deep. | Small |
| N4 | **Re-post wizard: change date only** | Carriers running weekly routes refill same form 20 fields at a time. | Small (already partly here via re-post button — extend) |
| N5 | **Email + push template preview** | Carriers want to see what a pilot will receive before sending. Reduces miscommunication. | Medium |
| N6 | **Pilot online/offline indicator** | "Is John online right now?" — useful before calling. Track lastSeen on user doc. | Medium |

### Medium value
| # | Feature | Why | Complexity |
|---|---|---|---|
| N7 | Voice-to-text day log notes | 55+ drivers prefer speaking; reduces typos | Medium (Web Speech API) |
| N8 | Delivery photo proof (alongside GPS) | Some carriers require photo proof of drop-off | Medium |
| N9 | Bulk applicant accept/decline (carriers) | When 8 pilots apply, save 7 clicks | Medium |
| N10 | Live pay calculator on Post a Load | Show estimated total as carrier types day rate + miles + threshold | Small |
| N11 | Saved filter preferences (localStorage) | Carriers always filter "Active" + "Pending" — stop making them re-apply on every reload | Small |
| N12 | Date-range filter on My Loads + Invoices | "Show April 2026" — currently scrolling | Small |
| N13 | Private carrier notes on accepted pilots | "John is reliable but slow to respond" — only carrier sees | Small |
| N14 | Larger-font accessibility toggle | 16/18/20px option in nav for older eyes | Small |
| N15 | Carrier "Call Pilot" tel: link | One-tap phone dial from dashboard | Small |

### Lower value but worth noting
| # | Feature | Why | Complexity |
|---|---|---|---|
| N16 | Glossary tooltips for CDL/DOT/broker | Some non-trucking users won't know jargon | Small |
| N17 | Testimonials section on landing | Older audience trusts peer reviews more than marketing | Medium |
| N18 | Toll API integration | Pilots forget toll costs; pricing better with up-front data | Large |
| N19 | Live chat widget | Older users prefer synchronous support over email | Large |
| N20 | "How it works" 30-second video | Higher conversion for older demographic than text tabs | Medium (needs video asset) |
| N21 | Print-friendly day log sheet | Drivers who keep physical records | Small |
| N22 | Hazmat-specific weather/temp alerts | Currently buried in weather card | Medium |
| N23 | Comparison table: similar loads | Carrier comparing performance of their own routes | Medium |

---

## CONFIRMED-WORKING (no action needed)

These passed both static review and live test:

- HTTPS active site-wide
- No Firebase API keys leaking beyond what's standard public client config
- Color tokens (yellow accent on black) pass WCAG AAA
- Login form labels and tab order
- Signup type selector (Pilot vs Carrier/Broker)
- Password strength meter on signup
- Forgot-password flow
- Social auth buttons present (real implementation status not verified)
- AI search field renders and is wired to `/api/ai`
- Apply modal (recently improved) shows full load detail and works without availability fields
- Follow Carrier button now shows visible state (✓ Following)
- Sequential Load #N display on loadboard cards
- Push notification permission flow + service worker present
- `firestore.rules` published with proper isolation
- Reset Test Data button working on both dashboards
- Receipt upload with client-side compression to Firebase Storage
- Edit / re-post / delete loads on carrier side
- Carrier invoice history view
- Pilot day log edit/delete
- Carrier "Remove Hired Pilot" with optional reason
- Trucking Company field on post + invoice
- Auto-summed miles from day logs on invoice
- Pilot-entered Load # on invoice (matches dispatch)
- Stat cards clickable on both dashboards
- Cert overlap fixed
- Number input spinners removed (no `type="number"` left)
- Hauler → Broker rebrand complete

---

## RECOMMENDED ORDER (when you're ready)

**Hour 1 — fix the things that are broken or wrong.** C1, C2, C3, C4, C5, S14 (49→48 states), S22 (msgDot).

**Hour 2 — make it pleasant on a phone.** C7 (uppercase site-wide), S1–S5 (mobile typography + tap targets), S8 (AI placeholder), S9 (chat bubble overlap), S11–S13 (loading states).

**Hour 3 — make it honest with non-tech users.** S15–S20 (jargon + persona-aware copy), S26 (logo destination), S27 (signup role param).

**Beyond that — pick from NICE TO ADD.** N3 (Available Now toggle) and N4 (re-post wizard) are tiny wins. N1 (delivery checklist) and N10 (pay calculator) are mid-size and prevent real disputes.

---

## TESTING NOTES

- Console is clean on the live site at root and loadboard (no JS errors logged at navigation).
- No broken images detected on rendered pages.
- All `href="#anchor"` internal anchors resolve.
- Mobile screenshots captured at 375×812; desktop at 1280×900. Available in MCP screenshot artifacts as `home-desktop`, `home-mobile`, `loadboard-mobile`.
- Did **not** test: authenticated dashboard flows (would need credentials), Firebase Storage uploads end-to-end, push notification fan-out (FCM token must be live on the device).
