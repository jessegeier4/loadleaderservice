// firebase-config.js
// Environment-aware Firebase config for LoadLeader.
//
// ES module — imported by index.html, dashboard.html, carrier-dashboard.html,
// loadboard.html, login.html. Each of those files calls
// `initializeApp(firebaseConfig)` themselves; this file just decides which config
// object to hand them based on the current hostname.
//
// Pack original ships as a global-SDK file (`firebase.initializeApp(...)`) — this
// version is adapted for the project's existing ES-module SDK usage.

// ============ PRODUCTION CONFIG ============
const PRODUCTION_CONFIG = {
  apiKey: "AIzaSyAzAeTkeBbkeuebjwhgj3nedgbdgbhJ1KI",
  authDomain: "load-leader.firebaseapp.com",
  projectId: "load-leader",
  storageBucket: "load-leader.firebasestorage.app",
  messagingSenderId: "411492756195",
  appId: "1:411492756195:web:ffd28b7e1dd32b2670f3d6"
};

// ============ STAGING CONFIG ============
const STAGING_CONFIG = {
  apiKey: "AIzaSyCc46L1Ee5r6g-3Ti-fyEczTPeO2Iw1mS8",
  authDomain: "loadleader-staging.firebaseapp.com",
  projectId: "loadleader-staging",
  storageBucket: "loadleader-staging.firebasestorage.app",
  messagingSenderId: "975417711682",
  appId: "1:975417711682:web:ee10c16d7fb744944c61db",
  measurementId: "G-YS4CP1K63Q"
};

// ============ AUTO-ROUTE ============
function pickConfig() {
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
  // Anything that's NOT the production domain is treated as staging.
  // - staging.loadleaderservice.com (custom subdomain, if added)
  // - staging--loadleaderservice.netlify.app (Netlify branch deploy)
  // - deploy-preview-*.netlify.app (Netlify PR previews)
  // - localhost / 127.0.0.1 (local dev)
  const isStaging =
    host === 'staging.loadleaderservice.com' ||
    host.includes('deploy-preview-') ||
    host.startsWith('staging--') ||
    host.endsWith('.netlify.app') ||
    host === 'localhost' ||
    host === '127.0.0.1';
  if (isStaging) {
    console.log('🟡 LoadLeader: using STAGING Firebase config (' + host + ')');
    return STAGING_CONFIG;
  }
  console.log('🟢 LoadLeader: using PRODUCTION Firebase config');
  return PRODUCTION_CONFIG;
}

export const firebaseConfig = pickConfig();
export const LOADLEADER_ENV =
  firebaseConfig.projectId === PRODUCTION_CONFIG.projectId ? 'production' : 'staging';

// Expose on window for non-module scripts and devtools convenience
if (typeof window !== 'undefined') window.LOADLEADER_ENV = LOADLEADER_ENV;

// Visual indicator on staging — so the two environments can never be confused by accident.
if (typeof document !== 'undefined' && LOADLEADER_ENV === 'staging') {
  const attachBanner = () => {
    if (document.getElementById('__loadleader_staging_banner')) return;
    const banner = document.createElement('div');
    banner.id = '__loadleader_staging_banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;background:#FFCD11;color:#0A0A0A;' +
      'font-family:Syne,sans-serif;font-weight:800;font-size:11px;letter-spacing:0.2em;' +
      'text-align:center;padding:6px;z-index:99999;text-transform:uppercase;';
    banner.textContent = '⚠ STAGING ENVIRONMENT — TEST DATA ONLY';
    document.body.appendChild(banner);
    document.body.style.paddingTop = '32px';
  };
  if (document.body) attachBanner();
  else document.addEventListener('DOMContentLoaded', attachBanner);
}
