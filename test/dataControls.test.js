const test = require('node:test');
const assert = require('node:assert/strict');
require.extensions['.css'] = () => {};
require('@babel/register')({ extensions: ['.js', '.jsx'], presets: ['@babel/preset-env', '@babel/preset-react'], ignore: [/node_modules/], cache: false });
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { JSDOM } = require('jsdom');
const { selectRows } = require('../components/DataControls/collection');
const { derivePprPage } = require('../components/PPR/pagination');
const FilteredCollection = require('../components/DataControls/FilteredCollection').default;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test('collection search and filters apply before numeric sorting; missing metrics stay last', () => {
  const rows = [{ name: 'Alpha', team: 'NE', score: 9 }, { name: 'Beta', team: 'NE', score: 100 }, { name: 'Alpine', team: 'NYJ', score: 20 }, { name: 'Absent', team: 'NE', score: null }];
  const options = { name: row => row.name, sort: row => row.score };
  assert.deepEqual(selectRows(rows, { ...options }).map(row => row.name), ['Beta', 'Alpine', 'Alpha', 'Absent']);
  assert.deepEqual(selectRows(rows, { ...options, direction: 'asc' }).map(row => row.name), ['Alpha', 'Alpine', 'Beta', 'Absent']);
  assert.deepEqual(selectRows(rows, { ...options, search: ' AL ', filters: [{ value: 'NE', get: row => row.team }] }).map(row => row.name), ['Alpha']);
  assert.equal(rows[0].name, 'Alpha');
});

test('PPR team filtering and ascending sorting precede pagination and preserve zero scores', () => {
  const stats = [{ Name: 'A', Team: 'NE', FantasyPointsPPR: null }, { Name: 'B', Team: 'NE', FantasyPointsPPR: 0 }, { Name: 'C', Team: 'NYJ', FantasyPointsPPR: 1 }, { Name: 'D', Team: 'NE', FantasyPointsPPR: 12 }];
  const page = derivePprPage({ stats, team: 'NE', direction: 'asc', sortBy: 'FantasyPointsPPR', pageSize: 2 });
  assert.deepEqual(page.items.map(row => row.Name), ['B', 'D']);
  assert.equal(page.totalItems, 3);
  assert.equal(page.totalPages, 2);
});

test('rendered controls filter all pages and reset pagination', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  global.window = dom.window; global.document = dom.window.document;
  const root = createRoot(document.getElementById('root'));
  const rows = Array.from({ length: 30 }, (_, index) => ({ name: `Player ${index}`, team: index === 0 ? 'NE' : 'NYJ', score: index }));
  const choose = (label, value) => {
    const select = [...document.querySelectorAll('label')].find(node => node.firstChild.textContent === label).querySelector('select');
    act(() => { select.value = value; select.dispatchEvent(new window.Event('change', { bubbles: true })); });
  };
  try {
    await act(async () => root.render(React.createElement(FilteredCollection, {
      rows, name: row => row.name, searchLabel: 'Search players',
      filterFields: [{ label: 'Team', allLabel: 'All teams', get: row => row.team }],
      sortOptions: [{ value: 'score', label: 'Points', get: row => row.score }],
    }, visible => React.createElement('ul', null, visible.map(row => React.createElement('li', { key: row.name }, row.name))))));
    act(() => document.querySelector('[aria-label="Next page"]').click());
    assert.match(document.querySelector('[role="status"]').textContent, /Page 2 of 2/);
    choose('Team', 'NE');
    assert.equal(document.querySelector('li').textContent, 'Player 0');
    assert.match(document.querySelector('[role="status"]').textContent, /1 matching results. Page 1 of 1/);
    act(() => [...document.querySelectorAll('button')].find(node => node.textContent === 'Reset filters').click());
    assert.equal(document.querySelectorAll('li').length, 25);
    choose('Sort direction', 'asc');
    assert.equal(document.querySelector('li').textContent, 'Player 0');
  } finally { act(() => root.unmount()); dom.window.close(); }
});

test('ranking requests cannot overwrite a newer result when responses arrive out of order', async () => {
  const { StatsProvider, StatsContext } = require('../components/context');
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  global.window = dom.window; global.document = dom.window.document;
  const previousFetch = global.fetch;
  const pending = [];
  global.fetch = () => new Promise(resolve => pending.push(resolve));
  let context;
  function Probe() { context = React.useContext(StatsContext); return null; }
  const root = createRoot(document.getElementById('root'));
  const response = name => ({ ok: true, json: async () => ({ data: [{ playerId: name, displayName: name, fantasyPointsPpr: 10, metrics: {} }] }) });
  try {
    await act(async () => root.render(React.createElement(StatsProvider, null, React.createElement(Probe))));
    let older, newer;
    act(() => { older = context.fetchStats('ppr'); newer = context.fetchStats('projection'); });
    await act(async () => { pending[1](response('Latest')); await newer; });
    assert.equal(context.stats[0].Name, 'Latest');
    await act(async () => { pending[0](response('Outdated')); await older; });
    assert.equal(context.stats[0].Name, 'Latest');
    assert.equal(context.dataKind, 'estimated');
    assert.equal(context.loading, false);
  } finally { act(() => root.unmount()); dom.window.close(); global.fetch = previousFetch; }
});
