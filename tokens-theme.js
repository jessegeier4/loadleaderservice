// LoadLeader theme system — light is the brand default.
// Resolution order on every page load:
//   1. Saved choice in localStorage (last toggle click) — strongest, persists forever
//   2. System preference (prefers-color-scheme) — for first-time visitors
//   3. Fallback: light (the brand default)
// Run inline in <head> before any CSS-dependent paint to prevent FOUC.
(function () {
  const KEY = 'll-theme';
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  } else {
    // No saved preference — defer to system, fall back to brand-default light.
    const prefersDark = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.documentElement.setAttribute('data-theme', 'dark');
    // else leave unset → :root rules apply → light default
  }

  // Toggle flips current state and saves the explicit choice. Once a user
  // toggles, their choice wins on every future visit (system preference is
  // ignored after they have explicitly picked).
  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  };

  // Optional: clear saved preference and follow system again. Available as
  // window.resetTheme() for power users / settings UI.
  window.resetTheme = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    document.documentElement.removeAttribute('data-theme');
    const prefersDark = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.documentElement.setAttribute('data-theme', 'dark');
  };
})();
