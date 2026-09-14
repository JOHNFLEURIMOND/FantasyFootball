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
  deriveProjectionPage,
} = require('../components/WeeklyProjections/pagination');

function projection(index, overrides = {}) {
  return {
    PlayerID: String(index),
    Name: `Player ${String(index).padStart(2, '0')}`,
    Position: index % 2 === 0 ? 'WR' : 'RB',
    FantasyPointsPPR: index,
    ReceivingYards: index * 10,
    ...overrides,
  };
}

test('projection pagination applies search, position, sorting, and bounded slicing', () => {
  const stats = Array.from({ length: 30 }, (_, index) => projection(index + 1));

  const result = deriveProjectionPage({
    stats,
    position: 'WR',
    sortBy: 'ReceivingYards',
    currentPage: 2,
    pageSize: 5,
  });

  assert.equal(result.totalItems, 15);
  assert.equal(result.totalPages, 3);
  assert.equal(result.activePage, 2);
  assert.deepEqual(
    result.items.map(player => player.ReceivingYards),
    [200, 180, 160, 140, 120]
  );
});

test('projection pagination deterministically breaks equal-value ties by name', () => {
  const result = deriveProjectionPage({
    stats: [
      projection(1, { Name: 'Zulu Player', FantasyPointsPPR: 10 }),
      projection(2, { Name: 'Alpha Player', FantasyPointsPPR: 10 }),
    ],
  });

  assert.deepEqual(
    result.items.map(player => player.Name),
    ['Alpha Player', 'Zulu Player']
  );
});

test('projection pagination does not mutate source order', () => {
  const stats = [projection(1), projection(3), projection(2)];

  deriveProjectionPage({ stats });

  assert.deepEqual(
    stats.map(player => player.FantasyPointsPPR),
    [1, 3, 2]
  );
});
