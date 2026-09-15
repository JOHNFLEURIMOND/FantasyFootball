const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { createNflverseRouter } = require('../server/routes/nflverseRoutes');

function meta(cacheStatus = 'fresh', recordsSkipped = 0) {
  return { cache: { cacheStatus }, recordsSkipped };
}

function provider({ cacheStatus = 'fresh', failPlayers = false, empty = false } = {}) {
  const sourceMeta = meta(cacheStatus);
  return {
    getPlayers: async () => {
      if (failPlayers) {
        const error = new Error('provider failed');
        error.status = 503;
        throw error;
      }
      return {
        data: empty ? [] : [
          {
            playerId: 'p1',
            firstName: 'Alpha',
            lastName: 'Receiver',
            displayName: 'Alpha Receiver',
            position: 'WR',
            teamId: 'NE',
            status: 'ACT',
            active: true,
          },
          {
            playerId: 'p2',
            firstName: 'Beta',
            lastName: 'Quarterback',
            displayName: 'Beta Quarterback',
            position: 'QB',
            teamId: 'NYJ',
            status: 'ACT',
            active: true,
          },
        ],
        meta: sourceMeta,
      };
    },
    getTeams: async () => ({
      data: empty ? [] : [
        {
          teamId: 'NE', abbreviation: 'NE', city: 'New England', name: 'Patriots',
          conference: 'AFC', division: 'AFC East', active: true,
          logoUrl: 'https://example.com/ne.png',
        },
        {
          teamId: 'NYJ', abbreviation: 'NYJ', city: 'New York', name: 'Jets',
          conference: 'AFC', division: 'AFC East', active: true,
          logoUrl: 'https://example.com/nyj.png',
        },
      ],
      meta: sourceMeta,
    }),
    getWeeklyStats: async season => ({
      data: empty ? [] : [
        {
          statId: `${season}:week:1:p1:NE`, playerId: 'p1', teamId: 'NE', gameId: null,
          season: String(season), week: 1, scope: 'week',
          metrics: { receptions: 5, receiving_yards: 100, receiving_tds: 1 },
        },
      ],
      meta: sourceMeta,
    }),
    getSeasonalStats: async season => ({
      data: empty ? [] : [
        {
          statId: `${season}:season:0:p1:NE`, playerId: 'p1', teamId: 'NE', gameId: null,
          season: String(season), week: 0, scope: 'season',
          metrics: { receptions: 75, receiving_yards: 1100, receiving_tds: 9 },
        },
      ],
      meta: sourceMeta,
    }),
    getSchedules: async season => ({
      data: empty ? [] : [
        {
          gameId: `${season}_01_NE_NYJ`, season: String(season), seasonType: 'regular', week: 1,
          startTime: `${season}-09-07T17:00:00.000Z`, status: 'complete',
          homeTeamId: 'NYJ', awayTeamId: 'NE', homeScore: 17, awayScore: 24,
        },
      ],
      meta: sourceMeta,
    }),
  };
}

function app(options) {
  const instance = express();
  instance.use('/api/nflverse', createNflverseRouter({ nflverseProvider: provider(options) }));
  return instance;
}

test('players support search filters and bounded pagination', async () => {
  const response = await request(app()).get('/api/nflverse/players?q=alpha&team=NE&position=WR&page=1&pageSize=1');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.data.length, 1);
  assert.equal(response.body.data.data[0].playerId, 'p1');
  assert.equal(response.body.data.meta.total, 1);
  assert.equal(response.body.data.meta.pageSize, 1);
});

test('player and team detail routes resolve canonical IDs', async () => {
  const player = await request(app()).get('/api/nflverse/players/p1');
  const team = await request(app()).get('/api/nflverse/teams/NE');
  assert.equal(player.status, 200);
  assert.equal(player.body.data.displayName, 'Alpha Receiver');
  assert.equal(team.status, 200);
  assert.equal(team.body.data.teamId, 'NE');
});

test('teams list uses bounded pagination and returns not found safely', async () => {
  const list = await request(app()).get('/api/nflverse/teams?pageSize=1');
  const missing = await request(app()).get('/api/nflverse/teams/XXX');
  assert.equal(list.status, 200);
  assert.equal(list.body.data.data.length, 1);
  assert.equal(list.body.data.meta.total, 2);
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
});

test('projections and rankings expose season week scoring source and freshness', async () => {
  const projections = await request(app({ cacheStatus: 'stale' })).get('/api/nflverse/projections?season=2025');
  const rankings = await request(app()).get('/api/nflverse/rankings?season=2025&format=ppr');
  assert.equal(projections.status, 200);
  assert.equal(projections.body.data.meta.season, 2025);
  assert.equal(projections.body.data.meta.week, 2);
  assert.equal(projections.body.data.meta.scoringFormat, 'ppr');
  assert.equal(projections.body.data.meta.stale, true);
  assert.equal(projections.body.data.data[0].dataType, 'estimated-projection');
  assert.equal(rankings.status, 200);
  assert.equal(rankings.body.data.meta.week, 1);
  assert.equal(rankings.body.data.data[0].dataType, 'observed-ranking');
});

test('schedule exposes status scores and team context while standings expose conference and division', async () => {
  const schedule = await request(app()).get('/api/nflverse/schedule?season=2025&week=1');
  const standings = await request(app()).get('/api/nflverse/standings?season=2025');
  assert.equal(schedule.status, 200);
  assert.equal(schedule.body.data.data[0].status, 'complete');
  assert.equal(schedule.body.data.data[0].awayScore, 24);
  assert.equal(schedule.body.data.data[0].awayTeam.logoUrl, 'https://example.com/ne.png');
  assert.equal(standings.status, 200);
  assert.equal(standings.body.data.data[0].conference, 'AFC');
  assert.equal(standings.body.data.data[0].division, 'AFC East');
});

test('weekly and seasonal statistics are distinct canonical resources', async () => {
  const weekly = await request(app()).get('/api/nflverse/stats/weekly?season=2025&week=1&playerId=p1');
  const seasonal = await request(app()).get('/api/nflverse/stats/seasonal?season=2025&playerId=p1');
  assert.equal(weekly.status, 200);
  assert.equal(weekly.body.data.meta.scope, 'week');
  assert.equal(weekly.body.data.data[0].scope, 'week');
  assert.equal(seasonal.status, 200);
  assert.equal(seasonal.body.data.meta.scope, 'season');
  assert.equal(seasonal.body.data.data[0].scope, 'season');
});

test('canonical routes cover empty validation stale and provider failure behavior', async () => {
  const empty = await request(app({ empty: true })).get('/api/nflverse/players');
  const invalidPage = await request(app()).get('/api/nflverse/players?pageSize=999');
  const invalidSeason = await request(app()).get('/api/nflverse/projections?season=nope');
  const invalidWeek = await request(app()).get('/api/nflverse/schedule?season=2025&week=99');
  const failure = await request(app({ failPlayers: true })).get('/api/nflverse/players');
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.data.data, []);
  assert.equal(invalidPage.status, 400);
  assert.equal(invalidSeason.status, 400);
  assert.equal(invalidWeek.status, 400);
  assert.equal(failure.status, 503);
  assert.equal(failure.body.error.message, 'The upstream provider returned an error.');
});
