// LoadLeader theme toggle — light is default, dark opt-in via [data-theme="dark"]
// Persists choice in localStorage. Run inline in <head> to prevent FOUC.
(function () {
  const KEY = 'll-theme';
  const stored = (function () {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  })();
  if (stored === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (stored === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // No stored preference = default light (no attribute set, :root rules apply)

  window.toggleTheme = function () {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  };
})();
