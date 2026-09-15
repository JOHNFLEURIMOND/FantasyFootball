const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { createNflverseRouter } = require('../server/routes/nflverseRoutes');

function createMockProvider() {
  const meta = { cache: { cacheStatus: 'fresh' }, recordsSkipped: 0 };
  return {
    getPlayers: async () => ({
      data: [{
        playerId: '00-0036322', firstName: 'Justin', lastName: 'Jefferson',
        displayName: 'Justin Jefferson', position: 'WR', teamId: 'MIN',
        status: 'ACT', active: true,
      }],
      meta,
    }),
    getTeams: async () => ({
      data: [{
        teamId: 'MIN', abbreviation: 'MIN', name: 'Vikings', city: 'Minnesota',
        conference: 'NFC', division: 'NFC North', active: true, logoUrl: null,
      }],
      meta,
    }),
    getSchedules: async season => ({
      data: [{
        gameId: `${season}_01_MIN_GB`, season: String(season), seasonType: 'regular',
        week: 1, startTime: `${season}-09-01T17:00:00.000Z`, status: 'scheduled',
        homeTeamId: 'MIN', awayTeamId: 'GB', homeScore: null, awayScore: null,
      }],
      meta,
    }),
    getWeeklyStats: async season => ({ data: [], meta }),
    getSeasonalStats: async season => ({ data: [], meta }),
    getMetadata: async () => ({ cacheStatus: 'fresh', lastUpdated: '2026-09-13T00:00:00Z' }),
    clearCache: async () => true,
  };
}

function request(app, method, path) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const req = http.request({ hostname: '127.0.0.1', port, path, method }, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          server.close();
          let parsed;
          try { parsed = JSON.parse(body); } catch (_error) { parsed = body; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      req.on('error', err => { server.close(); reject(err); });
      req.end();
    });
  });
}

describe('nflverse Express Routes', () => {
  const mockProvider = createMockProvider();
  const app = express();
  app.use(express.json());
  app.use('/api/nflverse', createNflverseRouter({ nflverseProvider: mockProvider }));

  test('GET /api/nflverse/players returns canonical paginated players', async () => {
    const res = await request(app, 'GET', '/api/nflverse/players');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.data[0].displayName, 'Justin Jefferson');
    assert.equal(res.body.data.meta.total, 1);
  });

  test('GET /api/nflverse/teams returns canonical paginated teams', async () => {
    const res = await request(app, 'GET', '/api/nflverse/teams');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.data[0].teamId, 'MIN');
  });

  test('GET /api/nflverse/schedules/:season preserves compatibility', async () => {
    const res = await request(app, 'GET', '/api/nflverse/schedules/2026');
    assert.equal(res.status, 200);
    assert.equal(res.body.data[0].season, '2026');
  });

  test('GET /api/nflverse/schedules/:season rejects non-numeric season', async () => {
    const res = await request(app, 'GET', '/api/nflverse/schedules/invalid-season');
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /Invalid season parameter/);
  });

  test('GET /api/nflverse/metadata returns metadata cache state', async () => {
    const res = await request(app, 'GET', '/api/nflverse/metadata');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.cacheStatus, 'fresh');
  });

  test('POST /api/nflverse/refresh clears cache successfully', async () => {
    const res = await request(app, 'POST', '/api/nflverse/refresh');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
