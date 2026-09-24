const test = require('node:test');
const assert = require('node:assert/strict');
require.extensions['.css'] = () => {};
require.extensions['.jpeg'] = module => { module.exports = '/assets/football.jpeg'; };
require('@babel/register')({ extensions: ['.js', '.jsx'], presets: ['@babel/preset-env', '@babel/preset-react'], ignore: [/node_modules/], cache: false });
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { getRouteMetadata } = require('../components/routing/RouteMetadata');
const { routeName, Router, NavLink } = require('../components/routing/SimpleRouter');
const { loadSeasonalStatistics } = require('../components/Dashboard/PublicDataPages');

test('public routes have distinct metadata and Schedule aliases share a canonical URL and announcement', () => {
  for (const path of ['/', '/players', '/teams', '/stats', '/schedule', '/standings']) {
    const meta = getRouteMetadata(path);
    assert.equal(meta.canonical, `https://fantasyfootball24.netlify.app${path}`);
    assert.equal(meta.noindex, false);
    assert.ok(meta.description.length > 20);
  }
  assert.deepEqual(getRouteMetadata('/Schedule'), getRouteMetadata('/schedule'));
  assert.equal(routeName('/schedule'), 'Schedule');
  assert.equal(routeName('/Schedule'), 'Schedule');
  assert.equal(routeName('/teams/NE'), 'Team players');
  assert.equal(getRouteMetadata('/unknown').noindex, true);
});

test('Schedule alias highlights the canonical navigation link', () => {
  const previous = global.window;
  global.window = { location: new URL('https://example.test/Schedule?week=2#top') };
  try {
    const html = renderToStaticMarkup(React.createElement(Router, null,
      React.createElement(NavLink, { to: '/schedule' }, 'Schedule')));
    assert.match(html, /href="\/schedule"/);
    assert.match(html, /aria-current="page"/);
  } finally { global.window = previous; }
});

test('statistics use canonical player names and retain stats if the name lookup fails', async () => {
  const previous = global.fetch;
  const stat = { statId: 's1', playerId: '00-123', metrics: { passing_yards: 100 } };
  try {
    global.fetch = async url => ({ ok: true, json: async () => url.includes('/stats/')
      ? { data: [stat], provenance: { stale: true } }
      : { data: { data: [{ playerId: '00-123', displayName: 'Example Player' }], meta: { totalPages: 1 } } } });
    const result = await loadSeasonalStatistics();
    assert.equal(result.data[0].displayName, 'Example Player');
    assert.equal(result.meta.stale, true);
    global.fetch = async url => {
      if (!url.includes('/stats/')) throw new Error('unavailable');
      return { ok: true, json: async () => ({ data: [stat] }) };
    };
    const fallback = await loadSeasonalStatistics();
    assert.deepEqual(fallback.data, [stat]);
    assert.equal(fallback.meta.partial, true);
  } finally { global.fetch = previous; }
});

test('application entry renders its lazy application shell', () => {
  const client = require('react-dom/client');
  const previousCreateRoot = client.createRoot;
  const previousDocument = global.document;
  const previousCss = require.extensions['.css'];
  let element;
  try {
    global.document = { getElementById: () => ({}) };
    require.extensions['.css'] = () => {};
    client.createRoot = () => ({ render: value => { element = value; } });
    require('../components/Main');
    assert.ok(element);
    assert.doesNotThrow(() => renderToStaticMarkup(element));
  } finally {
    client.createRoot = previousCreateRoot;
    global.document = previousDocument;
    if (previousCss) require.extensions['.css'] = previousCss;
    else delete require.extensions['.css'];
  }
});
