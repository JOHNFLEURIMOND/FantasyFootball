const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPprRankings,
  buildStandings,
  buildWeeklyProjections,
  calculatePprPoints,
} = require('../server/lib/fantasyMetrics');

const players = [
  {
    playerId: 'p1',
    displayName: 'Alpha Receiver',
    position: 'WR',
    teamId: 'NE',
  },
];

const weeklyStats = [1, 2, 3, 4, 5].map(week => ({
  playerId: 'p1',
  teamId: 'NE',
  season: '2025',
  week,
  scope: 'week',
  metrics: {
    receptions: week,
    receiving_yards: week * 10,
    receiving_tds: week === 5 ? 1 : 0,
  },
}));

test('calculatePprPoints applies documented full-PPR scoring', () => {
  assert.equal(
    calculatePprPoints({
      receptions: 5,
      receiving_yards: 100,
      receiving_tds: 1,
    }),
    21
  );
});

test('buildPprRankings aggregates observed weekly statistics deterministically', () => {
  const rankings = buildPprRankings({ players, weeklyStats, season: 2025 });
  assert.equal(rankings.length, 1);
  assert.equal(rankings[0].rank, 1);
  assert.equal(rankings[0].dataType, 'observed-ranking');
  assert.equal(rankings[0].scoringFormat, 'ppr');
  assert.equal(rankings[0].throughWeek, 5);
});

test('buildWeeklyProjections uses only the most recent four observed weeks', () => {
  const projections = buildWeeklyProjections({ players, weeklyStats, season: 2025 });
  assert.equal(projections.length, 1);
  assert.deepEqual(projections[0].sourceWeeks, [2, 3, 4, 5]);
  assert.equal(projections[0].sourceSampleSize, 4);
  assert.equal(projections[0].estimated, true);
  assert.equal(projections[0].week, 6);
});

test('buildStandings calculates wins losses ties and deterministic order', () => {
  const standings = buildStandings(
    [
      {
        status: 'complete',
        homeTeamId: 'NE',
        awayTeamId: 'NYJ',
        homeScore: 24,
        awayScore: 17,
      },
      {
        status: 'complete',
        homeTeamId: 'NYJ',
        awayTeamId: 'NE',
        homeScore: 20,
        awayScore: 20,
      },
    ],
    [
      { teamId: 'NE', city: 'New England', name: 'Patriots', conference: 'AFC', division: 'AFC East' },
      { teamId: 'NYJ', city: 'New York', name: 'Jets', conference: 'AFC', division: 'AFC East' },
    ]
  );

  assert.equal(standings[0].teamId, 'NE');
  assert.deepEqual(
    { wins: standings[0].wins, losses: standings[0].losses, ties: standings[0].ties },
    { wins: 1, losses: 0, ties: 1 }
  );
});
