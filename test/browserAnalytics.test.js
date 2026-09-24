const test = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserAnalytics, pageType } = require('../lib/browserAnalytics.cjs');
function setup(hostname = 'fantasyfootball24.netlify.app', saved = null) {
  const scripts = []; let reloads = 0;
  const window = { location: { hostname, reload: () => reloads++ }, localStorage: { getItem: () => saved, setItem: () => {} } };
  const document = { createElement: () => ({}), head: { appendChild: value => scripts.push(value) } };
  const tracker = createBrowserAnalytics({ window, document, hostname: 'fantasyfootball24.netlify.app', containerId: 'GTM-TEST123', measurementId: 'G-TEST123' });
  return { tracker, window, scripts, reloads: () => reloads };
}
test('no script or events before consent; one loader and page event after grant', () => {
  const s = setup(); s.tracker.page('/players');
  assert.equal(s.window.dataLayer, undefined); assert.equal(s.scripts.length, 0);
  s.tracker.setConsent('granted'); s.tracker.page('/teams'); s.tracker.page('/teams');
  assert.equal(s.scripts.length, 1);
  assert.equal(s.window.dataLayer[0][0], 'consent');
  assert.equal(s.window.dataLayer[0][2].analytics_storage, 'denied');
  assert.deepEqual(s.window.dataLayer[1][1], {
    page_location: 'https://fantasyfootball24.netlify.app/',
    page_title: 'Fantasy Football',
    page_referrer: '',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  assert.equal(s.window.dataLayer.filter(e => e.event === 'ff_page_view').length, 1);
});
test('navigation emits once per transition and strips dynamic identifiers', () => {
  const s = setup('fantasyfootball24.netlify.app', 'granted');
  s.tracker.page('/players/private-id'); s.tracker.page('/teams/NE'); s.tracker.page('/players/private-id');
  const events = s.window.dataLayer.filter(e => e.event === 'ff_page_view');
  assert.equal(events.length, 3); assert.equal(events[0].page_type, 'player_profile');
  assert.ok(!JSON.stringify(events).includes('private-id'));
  assert.equal(pageType('/unknown?email=secret'), 'not_found');
});
test('withdrawal disables measurement and unloads tags; future events suppressed', () => {
  const s = setup(); s.tracker.setConsent('granted'); s.tracker.page('/'); s.tracker.setConsent('denied');
  const length = s.window.dataLayer.length; s.tracker.page('/teams');
  assert.equal(s.window.dataLayer.length, length); assert.equal(s.window['ga-disable-G-TEST123'], true); assert.equal(s.reloads(), 1);
});
test('preview deployments never load production analytics', () => {
  const s = setup('deploy-preview-50--fantasyfootball24.netlify.app', 'granted');
  s.tracker.page('/'); assert.equal(s.tracker.enabled, false); assert.equal(s.scripts.length, 0);
});
test('unavailable storage fails closed and remains usable', () => {
  const window = { location: { hostname: 'fantasyfootball24.netlify.app' }, localStorage: { getItem() { throw Error(); }, setItem() { throw Error(); } } };
  const tracker = createBrowserAnalytics({ window, document: {}, containerId: '', measurementId: '', hostname: 'fantasyfootball24.netlify.app' });
  assert.equal(tracker.getConsent(), null); assert.doesNotThrow(() => tracker.setConsent('denied'));
});
test('withdrawal does not reload into a stale grant when both stores reject writes', () => {
  const s = setup('fantasyfootball24.netlify.app', 'granted');
  s.tracker.page('/');
  s.window.localStorage.setItem = () => { throw Error('blocked'); };
  s.window.sessionStorage = { setItem() { throw Error('blocked'); } };
  s.tracker.setConsent('denied');
  assert.equal(s.reloads(), 0);
  assert.equal(s.window['ga-disable-G-TEST123'], true);
  assert.equal(s.tracker.getConsent(), 'denied');
});
test('session denial overrides an older persistent grant', () => {
  const window = { location: { hostname: 'fantasyfootball24.netlify.app' },
    localStorage: { getItem: () => 'granted' }, sessionStorage: { getItem: () => 'denied' } };
  const tracker = createBrowserAnalytics({ window, document: {}, containerId: 'GTM-TEST123', measurementId: 'G-TEST123', hostname: 'fantasyfootball24.netlify.app' });
  tracker.page('/');
  assert.equal(tracker.getConsent(), 'denied');
  assert.equal(window.dataLayer, undefined);
});

test('both Schedule routes have the schedule analytics classification', () => {
  assert.equal(pageType('/schedule'), 'schedule');
  assert.equal(pageType('/Schedule'), 'schedule');
});
