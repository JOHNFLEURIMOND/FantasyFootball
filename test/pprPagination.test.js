const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const { derivePprPage } = require('../components/PPR/pagination');

function createPlayer(index, overrides = {}) {
  return {
    PlayerID: index,
    Name: `Player ${String(index).padStart(2, '0')}`,
    Position: index % 2 === 0 ? 'QB' : 'RB',
    FantasyPoints: index,
    ...overrides,
  };
}

test('PPR pagination slices filtered and sorted results', () => {
  const stats = Array.from({ length: 30 }, (_, index) => createPlayer(index + 1));

  const result = derivePprPage({
    stats,
    position: 'QB',
    sortBy: 'FantasyPoints',
    currentPage: 2,
    pageSize: 5,
  });

  assert.equal(result.totalItems, 15);
  assert.equal(result.totalPages, 3);
  assert.equal(result.activePage, 2);
  assert.deepEqual(
    result.items.map(player => player.FantasyPoints),
    [20, 18, 16, 14, 12]
  );
});

test('PPR pagination resets out-of-range pages to the last available page', () => {
  const result = derivePprPage({
    stats: [
      createPlayer(1, { Name: 'Alpha Runner' }),
      createPlayer(2, { Name: 'Beta Quarterback' }),
    ],
    search: 'alpha',
    currentPage: 4,
    pageSize: 1,
  });

  assert.equal(result.totalItems, 1);
  assert.equal(result.totalPages, 1);
  assert.equal(result.activePage, 1);
  assert.equal(result.items[0].Name, 'Alpha Runner');
});

test('PPR pagination does not mutate the source order while sorting', () => {
  const stats = [createPlayer(1), createPlayer(3), createPlayer(2)];

  derivePprPage({ stats, sortBy: 'FantasyPoints' });

  assert.deepEqual(
    stats.map(player => player.FantasyPoints),
    [1, 3, 2]
  );
});
