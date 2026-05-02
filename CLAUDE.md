# CLAUDE.md

Behavioral guidelines for Claude Code working on the LoadLeader project.
Read this file at the start of every session before doing anything else.

**Tradeoff:** These guidelines bias toward caution over speed.
For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them. Don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?"
If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it. Don't delete it.
- NO shortcuts
  

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently.
Weak criteria ("make it work") require constant clarification.

## 5. Verify Before Claiming Done

Never say "this is working" or "I fixed it" without proof.
- Run the code if possible
- Show the output or test result
- If you cannot test it, say "I have not tested this — please verify"
- Never assume a fix worked because it compiled or looked right

## 6. Read Before Writing

Before editing any file:
- Read the entire file first, not just the section being edited
- Check for existing helper functions before writing new ones
- Check imports/script tags at the top — do not duplicate
- If a file is over 500 lines, summarize its structure before editing

## 7. Ask, Don't Guess

Stop and ask when:
- File or function names are ambiguous
- Multiple files could be the right one to edit
- The user's request could mean two different things
- You would need to invent data, IDs, or env variable names
- A required env variable is not visible in the codebase

Never invent: API keys, env variable names, function signatures,
database schemas, file paths, or Firestore collection names.

## 8. Git Discipline

After completing any task:
- Show me the exact git commands to commit and push
- Use clear commit messages following this format:
  ```
  type: short description

  - what changed
  - why it changed
  ```
  Types: feat, fix, refactor, docs, style, chore
- Never commit directly to main — always feature branches
- Never force push without explicit permission

## 9. Environment & Secrets

- Never hardcode API keys, tokens, or sensitive URLs
- Frontend secrets go in Netlify environment variables
- Backend secrets go in Render environment variables
- Firebase config is public-safe — those keys can be in client code
- Never log env variables or print them in console output

## 10. When You Are Wrong

If I correct you:
- Acknowledge the mistake clearly in one sentence
- Add it to the Mistake Log below with date
- Do not defend the original approach
- Do not apologize repeatedly — fix it and move on

## 11. Output Format

- Show file paths before showing code
- Use code blocks with language tags
- For multi-file changes, list every file you touched at the end
- Keep explanations short — code over prose
- No emojis unless I use them first

---

## LoadLeader Project Context

### Stack
- Frontend: Plain HTML/CSS/JS on Netlify (loadleader-site repo)
- Backend: Node.js Express on Render (loadleader-api repo)
- Database: Firebase Firestore
- Auth: Firebase Auth
- Storage: Firebase Storage
- No React, no TypeScript, no build steps, no bundlers

### Stack Rules
- Edit only what is needed — never rewrite whole files
- No new dependencies without asking first
- Keep JS inline in HTML files — no separate JS files
- Vanilla JS only — no frameworks, no libraries except what's already loaded
- Template literals must never contain apostrophes in words — use full words
- All Firestore functions dynamically imported to avoid index errors
- Never add orderBy() without a confirmed composite index — sort client-side instead
- Never use limit() as a standalone import — fetch all and filter client-side

### File Structure
- `dashboard.html` → pilot dashboard
- `carrier-dashboard.html` → carrier dashboard
- `loadboard.html` → public load board
- `login.html` → auth page
- `index.html` → homepage
- `server.js` → Render backend (email, AI proxy)
- `sw.js` → service worker (never cache HTML)

### Firebase
- Project: `load-leader`
- Collections: `loads`, `applications`, `users`, `messages`, `conversations`, `fleet`, `follows`, `reviews`, `invoices`, `permits`, `savedLoads`, `loadTemplates`

### Backend Boundaries
- **Render backend** owns: existing business logic, email sends, AI proxy
- **Firebase** owns: auth, storage, real-time data, notifications, user data
- Never mix these responsibilities
- Never rewrite existing Render endpoints — add new ones alongside

---

## Audience: Drivers 25-45 — Modern SaaS Feel

Every UI decision must serve drivers aged 25-45 who are:
- Comfortable with modern apps (Linear, Stripe, Vercel-tier polish)
- On phones in trucks or job sites — touch first
- Want speed and confidence, not hand-holding
- References: Linear, Vercel, Stripe, Cursor (clean, restrained, fast)

### Design Rules
- Base font size 16px minimum for body, 14px floor for micro-labels (eyebrow, hint text)
- Headings — H1 36px desktop / 30px mobile, H2 24px, H3 18px, weight 600, line-height 1.2
- High contrast text in both dark and light modes (light mode auto-applies via prefers-color-scheme)
- Minimum tap target 48x48px on touch
- One primary CTA per section
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px — pick from this set
- Border-radius: 6px buttons + cards + inputs (set in tokens.css), 4px chips
- AVOID: glassmorphism, gradient text, decorative emoji, animated continuous gradient borders, custom dot+ring cursors, mouse trails, click ripples, particle effects, all-caps body text, font-weight or letter-spacing changes on hover (causes reflow)
- Yellow #FFCD11 lives alone — never gradient yellow → orange/green; only `--accent-hot` (lighter) and `--accent-dim` (darker)

### Motion Rules
- Interactive feedback (hover, click, focus): ≤300ms, default 120-200ms ease-out
- Scroll reveals: 400-600ms ease-out is fine — they're a separate motion class from interactive feedback
- Animate `transform` and `opacity` only — never `width`, `height`, `top`, `left`, `margin` (triggers layout)
- Subtle scale OK (≤1.02) on small interactive elements; never on text-heavy elements (sub-pixel blur)
- Mouse-parallax / mouse-tracking spotlight allowed at small amplitude (≤12px) — guard with `@media (hover: hover)` so touch users get a static surface
- Always respect `prefers-reduced-motion: reduce` — wrap meaningful keyframes/transitions
- Stagger reveals via `--i` custom prop on children, 60ms increment — no JS arrays needed

### Interaction Patterns We Use (the playbook)
- Primary CTAs: brighten + 1px lift + soft shadow on hover, inset top highlight always-on, 80ms press
- Cards: border-tint to `--line-hover` + 1px lift + low-opacity shadow on hover; mouse-tracking radial spotlight on feature cards (pricing, hero feature grids)
- Nav links: color fade + left-origin underline grows on hover (pseudo-element, no layout shift)
- Tabs: sliding pill or underline indicator behind active tab — tabs themselves don't move
- Inputs: border to `--accent` on focus + 3px low-alpha accent ring; floating label that lifts on focus or filled state
- Section reveals: IntersectionObserver, `opacity:0 + translateY(16px)` → in-view, once only, stagger via `--i`
- Selection color: yellow at 35% alpha + black text
- Focus ring: two-color (white inner halo + accent ring) so it shows on yellow buttons AND dark surfaces

---

## Known Issues — Never Repeat

Each entry: what broke, when discovered, how to avoid.

- **Apostrophes in template literals** break JS parser — use full words ("does not" instead of "doesn't")
- **orderBy() requires composite index** — avoid or sort client-side after fetching
- **Service worker caching HTML** causes stale content — never cache .html files
- **limit() import fails silently** — fetch all records, filter client-side
- **Literal newlines in confirm() strings** break JS — use \n escape sequence

---

## Mistake Log

Every time I correct you, add a one-line entry here with the date.
Read this section before starting any task.

Format: `YYYY-MM-DD — what went wrong → what to do instead`

<!-- Add entries below this line as we work -->
- 2026-04-28 — split `allow write` + `allow update` in `match /users/{userId}` denied owner self-updates (cross-user `update` expression errored on missing rating field; Firestore treats erroring rules as deny even with OR semantics) → collapse into single `allow update: if isOwner(userId) || (cross-user bounds)` so owner short-circuits before any potentially-erroring access
- 2026-04-28 — declared Firestore + Storage rule changes "shipped" without simulating in Rules Playground; user found the rule-deny bug after deploy → ALWAYS simulate owner-update, cross-user-deny, and unauthenticated cases in Rules Playground before declaring rule changes done
- 2026-04-28 — initial CSP `_headers` missed `https://*.firebasestorage.app` and `https://www.gstatic.com` from `connect-src`, blocking SDK source maps and risking Storage upload failure → when adding CSP for a Firebase project include the full set listed in `feedback_loadleader_security.md` entry #12


---

## Skill Triggers

When the user says any of the following, follow the matching protocol:

### "grill me"
Interview the user relentlessly about every aspect of their plan or design
until you reach shared understanding. Walk down each branch of the decision
tree, resolving dependencies between decisions one-by-one. For each question,
provide your recommended answer. Ask the questions one at a time. If a
question can be answered by exploring the codebase, explore the codebase
instead.

### "audit the site"
Run a full UX, content, feature, security, and performance audit of the
entire app. Document findings in three buckets: CRITICAL (broken or blocking),
SHOULD CHANGE (hurts UX), NICE TO ADD (improvements). Do not fix anything
without approval — present the report and wait for direction.

### "verify"
Show proof the change works: console output, screenshot, or test result.
If you cannot verify it yourself, list the exact steps the user should
take to verify, then stop.
