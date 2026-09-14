const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { createNflverseRouter } = require('../server/routes/nflverseRoutes');

// Mock nflverse provider implementation
function createMockProvider() {
  return {
    getPlayers: async () => [{ id: '00-0036322', name: 'Justin Jefferson', position: 'WR' }],
    getTeams: async () => [{ id: 'MIN', name: 'Minnesota Vikings' }],
    getSchedules: async (season) => [{ season, week: 1, homeTeam: 'MIN', awayTeam: 'GB' }],
    getWeeklyStats: async (season) => [{ season, player_id: '00-0036322', receiving_yards: 140 }],
    getSeasonalStats: async (season) => [{ season, player_id: '00-0036322', total_yards: 1800 }],
    getMetadata: async () => ({ cacheStatus: 'fresh', lastUpdated: '2026-09-13T00:00:00Z' }),
    clearCache: async () => true,
  };
}

// Helper to run HTTP requests against Express instance without external libraries
function request(app, method, path) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = { hostname: '127.0.0.1', port, path, method };
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          server.close();
          let parsed;
          try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      
      req.on('error', (err) => { server.close(); reject(err); });
      req.end();
    });
  });
}

describe('nflverse Express Routes', () => {
  const mockProvider = createMockProvider();
  const app = express();
  app.use(express.json());
  app.use('/api/nflverse', createNflverseRouter({ nflverseProvider: mockProvider }));

  test('GET /api/nflverse/players returns normalized players', async () => {
    const res = await request(app, 'GET', '/api/nflverse/players');
    assert.equal(res.status, 200);
    assert.equal(res.body.provenance.provider, 'nflverse');
    assert.equal(res.body.data[0].name, 'Justin Jefferson');
  });

  test('GET /api/nflverse/teams returns team list', async () => {
    const res = await request(app, 'GET', '/api/nflverse/teams');
    assert.equal(res.status, 200);
    assert.equal(res.body.data[0].id, 'MIN');
  });

  test('GET /api/nflverse/schedules/:season validates valid season parameter', async () => {
    const res = await request(app, 'GET', '/api/nflverse/schedules/2026');
    assert.equal(res.status, 200);
    assert.equal(res.body.data[0].season, 2026);
  });

  test('GET /api/nflverse/schedules/:season rejects non-numeric season', async () => {
    const res = await request(app, 'GET', '/api/nflverse/schedules/invalid-season');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.message, 'Invalid season parameter');
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