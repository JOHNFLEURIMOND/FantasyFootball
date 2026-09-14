const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { createNflverseRouter } = require('../server/routes/nflverseRoutes');

const meta = {
  cache: { cacheStatus: 'fresh' },
  recordsSkipped: 0,
};

function provider() {
  return {
    getPlayers: async () => ({
      data: [
        {
          playerId: 'p1',
          displayName: 'Alpha Receiver',
          position: 'WR',
          teamId: 'NE',
        },
      ],
      meta,
    }),
    getTeams: async () => ({
      data: [
        {
          teamId: 'NE',
          abbreviation: 'NE',
          city: 'New England',
          name: 'Patriots',
          conference: 'AFC',
          division: 'AFC East',
          logoUrl: 'https://example.com/ne.png',
        },
        {
          teamId: 'NYJ',
          abbreviation: 'NYJ',
          city: 'New York',
          name: 'Jets',
          conference: 'AFC',
          division: 'AFC East',
          logoUrl: 'https://example.com/nyj.png',
        },
      ],
      meta,
    }),
    getWeeklyStats: async season => ({
      data: [
        {
          playerId: 'p1',
          teamId: 'NE',
          season: String(season),
          week: 1,
          scope: 'week',
          metrics: { receptions: 5, receiving_yards: 100, receiving_tds: 1 },
        },
      ],
      meta,
    }),
    getSeasonalStats: async () => ({ data: [], meta }),
    getSchedules: async season => ({
      data: [
        {
          gameId: `${season}_01_NE_NYJ`,
          season: String(season),
          week: 1,
          startTime: `${season}-09-07T17:00:00.000Z`,
          status: 'complete',
          homeTeamId: 'NYJ',
          awayTeamId: 'NE',
          homeScore: 17,
          awayScore: 24,
        },
      ],
      meta,
    }),
  };
}

function app() {
  const instance = express();
  instance.use('/api/nflverse', createNflverseRouter({ nflverseProvider: provider() }));
  return instance;
}

test('GET /projections returns labeled application estimates', async () => {
  const response = await request(app()).get('/api/nflverse/projections?season=2025');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.meta.estimated, true);
  assert.equal(response.body.data.meta.scoringFormat, 'ppr');
  assert.equal(response.body.data.data[0].dataType, 'estimated-projection');
});

test('GET /rankings?format=ppr returns observed rankings', async () => {
  const response = await request(app()).get('/api/nflverse/rankings?season=2025&format=ppr');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.data[0].rank, 1);
  assert.equal(response.body.data.data[0].dataType, 'observed-ranking');
});

test('GET /schedule binds season week scores status and team logos', async () => {
  const response = await request(app()).get('/api/nflverse/schedule?season=2025&week=1');
  assert.equal(response.status, 200);
  const game = response.body.data.data[0];
  assert.equal(game.week, 1);
  assert.equal(game.status, 'complete');
  assert.equal(game.awayScore, 24);
  assert.equal(game.awayTeam.logoUrl, 'https://example.com/ne.png');
});

test('GET /standings returns calculated public standings', async () => {
  const response = await request(app()).get('/api/nflverse/standings?season=2025');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.data[0].teamId, 'NE');
  assert.equal(response.body.data.data[0].wins, 1);
});

test('canonical derived routes reject invalid parameters safely', async () => {
  const badSeason = await request(app()).get('/api/nflverse/projections?season=nope');
  assert.equal(badSeason.status, 400);

  const badFormat = await request(app()).get('/api/nflverse/rankings?season=2025&format=standard');
  assert.equal(badFormat.status, 400);

  const badWeek = await request(app()).get('/api/nflverse/schedule?season=2025&week=99');
  assert.equal(badWeek.status, 400);
});
