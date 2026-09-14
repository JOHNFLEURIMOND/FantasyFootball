const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const {
  buildComparisonRows,
  buildLeaderboard,
  buildPlayerProfile,
} = require('../components/Players/playerResearch');
const { resolveDataRouteState } = require('../components/routing/dataRouteState');

const players = [
  { playerId: 'p1', displayName: 'Alpha Receiver', position: 'WR', teamId: 'NE' },
  { playerId: 'p2', displayName: 'Beta Runner', position: 'RB', teamId: 'NYJ' },
  { playerId: 'p3', displayName: 'Gamma Receiver', position: 'WR', teamId: 'BUF' },
];
const teams = [{ teamId: 'NE', name: 'Patriots', city: 'New England' }];
const weeklyStats = [
  { statId: '1', playerId: 'p1', teamId: 'NE', season: '2025', week: 1, metrics: { receptions: 5, receiving_yards: 100 } },
  { statId: '2', playerId: 'p1', teamId: 'NE', season: '2025', week: 2, metrics: { receptions: 6, receiving_yards: 90 } },
  { statId: '3', playerId: 'p2', teamId: 'NYJ', season: '2025', week: 1, metrics: { rushing_yards: 80 } },
  { statId: '4', playerId: 'p3', teamId: 'BUF', season: '2025', week: 1, metrics: { receptions: 5, receiving_yards: 100 } },
];
const seasonalStats = [{ statId: 's1', playerId: 'p1', teamId: 'NE', season: '2025', metrics: { receiving_yards: 190 } }];

test('player profile separates weekly logs and seasonal totals', () => {
  const profile = buildPlayerProfile({ playerId: 'p1', players, teams, weeklyStats, seasonalStats });
  assert.equal(profile.player.displayName, 'Alpha Receiver');
  assert.equal(profile.weekly.length, 2);
  assert.equal(profile.seasonal.length, 1);
  assert.equal(profile.team.teamId, 'NE');
});

test('comparison aligns players and explicitly marks missing data', () => {
  const rows = buildComparisonRows({ playerIds: ['p1', 'missing'], players, weeklyStats, season: 2025, week: 1 });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].games, 1);
  assert.equal(rows[1].missing, true);
});

test('leaderboard filtering sorting and pagination are deterministic and bounded', () => {
  const first = buildLeaderboard({ players, weeklyStats, season: 2025, position: 'WR', sortBy: 'fantasyPointsPpr', page: 99, pageSize: 1 });
  assert.equal(first.totalItems, 2);
  assert.equal(first.totalPages, 2);
  assert.equal(first.activePage, 2);
  assert.equal(first.items.length, 1);

  const ordered = buildLeaderboard({ players, weeklyStats, season: 2025, week: 1, position: 'WR', sortBy: 'receivingYards', page: 1, pageSize: 25 });
  assert.equal(ordered.items[0].displayName, 'Alpha Receiver');
  assert.equal(ordered.items[1].displayName, 'Gamma Receiver');
});

for (const feature of ['Player profile', 'Comparison tool', 'Leaderboards']) {
  test(`${feature} state contract covers loading empty partial stale and error`, () => {
    assert.equal(resolveDataRouteState({ loading: true }).primary, 'loading');
    assert.equal(resolveDataRouteState({ items: [] }).primary, 'empty');
    const partial = resolveDataRouteState({ items: [{}], partial: true });
    assert.equal(partial.primary, 'success');
    assert.equal(partial.partial, true);
    const stale = resolveDataRouteState({ items: [{}], stale: true });
    assert.equal(stale.stale, true);
    assert.equal(resolveDataRouteState({ error: new Error('failed') }).primary, 'failure');
  });
}
