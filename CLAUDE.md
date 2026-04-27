# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. 
Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. 
For trivial tasks, use judgment.

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

---

**These guidelines are working if:** fewer unnecessary changes in diffs, 
fewer rewrites due to overcomplication, and clarifying questions come 
before implementation rather than after mistakes.

## LoadLeader Project Context

## Stack
- Frontend: Plain HTML/CSS/JS on Netlify (loadleader-site repo)
- Backend: Node.js Express on Render (loadleader-api repo)
- Database: Firebase Firestore
- Auth: Firebase Auth
- No React, no TypeScript, no build steps, no bundlers

## Rules
- Edit only what is needed — never rewrite whole files
- No new dependencies without asking first
- Keep JS inline in HTML files — no separate JS files
- Vanilla JS only — no frameworks, no libraries
- Template literals must never contain apostrophes in words — use full words
- All Firestore functions dynamically imported to avoid index errors
- Never add orderBy() without a confirmed composite index — sort client-side instead
- Never use limit() as a standalone import — fetch all and filter client-side

## File Structure
- dashboard.html → pilot dashboard
- carrier-dashboard.html → carrier dashboard
- loadboard.html → public load board
- login.html → auth page
- index.html → homepage
- server.js → Render backend (email, AI proxy)
- sw.js → service worker (never cache HTML)

## Firebase
- Project: load-leader
- Collections: loads, applications, users, messages, conversations, fleet, follows, reviews, invoices, permits, savedLoads, loadTemplates

## Known Issues — Never Repeat
- Apostrophes in template literals break JS parser — use full words
- orderBy() requires composite index — avoid or sort client-side
- Service worker caching HTML causes stale content — never cache .html
- limit() import fails silently — fetch all, filter client-side
- Literal newlines in confirm() strings break JS — use \n escape

- ---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
