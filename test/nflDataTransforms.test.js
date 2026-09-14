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
  buildPprRankings,
  buildScheduleCards,
  buildWeeklyProjections,
  calculatePprPoints,
} = require('../components/api/nflDataTransforms');

const player = {
  playerId: '00-1',
  displayName: 'Test Receiver',
  position: 'WR',
  teamId: 'NE',
  active: true,
};

function weeklyStat(week, metrics) {
  return {
    statId: `2026:week:${week}:00-1:NE`,
    playerId: '00-1',
    teamId: 'NE',
    gameId: null,
    season: '2026',
    week,
    scope: 'week',
    metrics,
  };
}

test('calculatePprPoints applies documented full-PPR scoring', () => {
  const points = calculatePprPoints({
    receptions: 8,
    receiving_yards: 100,
    receiving_tds: 1,
    rushing_yards: 10,
  });

  assert.equal(points, 25);
});

test('buildPprRankings aggregates observed weekly statistics', () => {
  const rankings = buildPprRankings({
    players: [player],
    weeklyStats: [
      weeklyStat(1, { receptions: 5, receiving_yards: 50 }),
      weeklyStat(2, { receptions: 7, receiving_yards: 80, receiving_tds: 1 }),
    ],
  });

  assert.equal(rankings.length, 1);
  assert.equal(rankings[0].Name, 'Test Receiver');
  assert.equal(rankings[0].FantasyPointsPPR, 31);
  assert.match(rankings[0].DataLabel, /Observed statistics/);
});

test('buildWeeklyProjections uses at most the four most recent observed weeks', () => {
  const weeklyStats = [
    weeklyStat(1, { receptions: 1, receiving_yards: 10 }),
    weeklyStat(2, { receptions: 2, receiving_yards: 20 }),
    weeklyStat(3, { receptions: 3, receiving_yards: 30 }),
    weeklyStat(4, { receptions: 4, receiving_yards: 40 }),
    weeklyStat(5, { receptions: 5, receiving_yards: 50 }),
  ];

  const projections = buildWeeklyProjections({ players: [player], weeklyStats });

  assert.equal(projections.length, 1);
  assert.equal(projections[0].Week, 6);
  assert.equal(projections[0].Receptions, 3.5);
  assert.equal(projections[0].ReceivingYards, 35);
  assert.equal(projections[0].FantasyPointsPPR, 7);
  assert.match(projections[0].DataLabel, /Estimated projection/);
  assert.match(projections[0].DataLabel, /4-game trailing average/);
});

test('buildScheduleCards preserves canonical scores and status', () => {
  const cards = buildScheduleCards([
    {
      gameId: '2026_01_NE_NYJ',
      season: '2026',
      week: 1,
      startTime: '2026-09-13T17:00:00.000Z',
      status: 'complete',
      awayTeamId: 'NE',
      homeTeamId: 'NYJ',
      awayScore: 24,
      homeScore: 17,
    },
  ]);

  assert.equal(cards[0].GameKey, '2026_01_NE_NYJ');
  assert.equal(cards[0].AwayScore, 24);
  assert.equal(cards[0].HomeScore, 17);
  assert.equal(cards[0].Status, 'complete');
});
