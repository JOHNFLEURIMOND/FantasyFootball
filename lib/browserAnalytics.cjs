// Basic consent mode: no Google script or queued behavioral events before opt-in.
const ROUTES = {
  '/': 'home', '/players': 'players', '/teams': 'teams',
  '/standings': 'standings', '/stats': 'stats', '/compare': 'compare',
  '/leaderboards': 'leaderboards', '/WeeklyProjections': 'projections',
  '/PPR': 'rankings', '/Schedule': 'schedule',
};
const KEY = 'ff.analytics.consent.v1';
function pageType(path) {
  if (ROUTES[path]) return ROUTES[path];
  if (/^\/players\/[^/]+$/.test(path)) return 'player_profile';
  if (/^\/teams\/[^/]+$/.test(path)) return 'team_roster';
  return 'not_found';
}
function createBrowserAnalytics({ window: win, document: doc, containerId, measurementId, hostname }) {
  const enabled = /^GTM-[A-Z0-9]+$/.test(containerId || '') &&
    /^G-[A-Z0-9]+$/.test(measurementId || '') &&
    hostname === 'fantasyfootball24.netlify.app' && win.location.hostname === hostname;
  let consent = null;
  let revocationPersisted = false;
  try { const value = win.localStorage.getItem(KEY); if (['granted', 'denied'].includes(value)) consent = value; } catch { /* Default denied. */ }
  try { if (win.sessionStorage?.getItem(KEY) === 'denied') consent = 'denied'; } catch { /* Storage may be unavailable. */ }
  let started = false;
  let lastPath = null;
  function command() { win.dataLayer.push(arguments); }
  function start() {
    if (!enabled || consent !== 'granted' || started) return;
    started = true;
    win.dataLayer = win.dataLayer || [];
    command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    // Defaults for any Google-generated events; explicit page views override these.
    command('set', {
      page_location: `https://${hostname}/`,
      page_title: 'Fantasy Football',
      page_referrer: '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    command('consent', 'update', { analytics_storage: 'granted' });
    win[`ga-disable-${measurementId}`] = false;
    win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    doc.head.appendChild(script);
  }
  return {
    enabled,
    getConsent: () => consent,
    setConsent(value) {
      if (!['granted', 'denied'].includes(value)) return;
      consent = value;
      revocationPersisted = false;
      try { win.localStorage.setItem(KEY, value); revocationPersisted = true; } catch { /* Keep the in-memory choice. */ }
      try {
        if (win.sessionStorage) {
          win.sessionStorage.setItem(KEY, value);
          revocationPersisted = true;
        }
      } catch { /* Keep measurement disabled if withdrawal cannot be saved. */ }
      if (value === 'denied') {
        lastPath = null;
        win[`ga-disable-${measurementId}`] = true;
        if (started) command('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        // Reload unloads GTM and all its listeners after consent withdrawal.
        if (started && revocationPersisted) win.location.reload();
      } else start();
    },
    page(path) {
      if (!enabled || consent !== 'granted' || path === lastPath) return;
      start();
      lastPath = path;
      const type = pageType(path);
      // Do not transmit search text, URL parameters, hashes, or dynamic identifiers.
      win.dataLayer.push({ event: 'ff_page_view', page_type: type,
        page_location: `https://${hostname}/${type === 'home' ? '' : type}`,
        page_title: `Fantasy Football | ${type}`, page_referrer: '' });
    },
  };
}
module.exports = { createBrowserAnalytics, pageType };
