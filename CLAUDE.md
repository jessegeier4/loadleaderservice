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

## Audience: Pilot Car & Truck Drivers

Every UI decision must serve drivers aged 35-70 who are:
- Often using phones in trucks or job sites
- Not necessarily tech-savvy
- Need information fast with zero confusion

### Design Rules (non-negotiable)
- Base font size 18px minimum, never smaller
- Headings: 32-48px on mobile, 48-72px on desktop
- High contrast only — no gray-on-gray, no light text on light bg
- Minimum tap target 48x48px everywhere
- Phone number visible in header AND tappable on every page
- One primary CTA per section, never two competing CTAs
- Generous whitespace — padding/margin never less than 16px
- Plain English — no app jargon, no tech-speak

### Animation Rules
- Scroll animations: fade-in + 20px slide up only
- No rotation, no scale, no parallax, no 3D transforms
- Animation duration 0.4s-0.6s, ease-out
- Never animate more than 3 elements simultaneously
- Always respect prefers-reduced-motion

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
