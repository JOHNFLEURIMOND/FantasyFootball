const test = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../server/createApp');
const original = createApp.createDefaultNflverseProvider;
const calls = [];
const player = { playerId: 'p1', firstName: 'Test', lastName: 'Player', displayName: 'Test Player', position: 'QB', teamId: 'NE', status: 'ACT', active: true };
createApp.createDefaultNflverseProvider = () => ({
  getRosters: async season => { calls.push(['rosters', season]); return { data: [player] }; },
  getPlayers: async () => { calls.push(['players']); return { data: [player] }; },
});
const { handler } = require('../netlify/functions/api');
createApp.createDefaultNflverseProvider = original;
const request = queryStringParameters => handler({ httpMethod: 'GET', path: '/api/nflverse/players', queryStringParameters });

test('Netlify player directory uses requested season rosters, filters, and reports the season', async () => {
  const response = await request({ season: '2026', team: 'NE', position: 'QB', q: 'test' });
  assert.equal(response.statusCode, 200);
  const payload = JSON.parse(response.body).data;
  assert.equal(payload.meta.season, 2026);
  assert.equal(payload.data[0].playerId, 'p1');
  assert.deepEqual(calls.at(-1), ['rosters', 2026]);
  const empty = await request({ season: '2026', team: 'NYJ' });
  assert.equal(JSON.parse(empty.body).data.data.length, 0);
});

test('Netlify historical directory remains available and invalid seasons are rejected', async () => {
  assert.equal((await request({})).statusCode, 200);
  assert.deepEqual(calls.at(-1), ['players']);
  const count = calls.length;
  assert.equal((await request({ season: 'invalid' })).statusCode, 400);
  assert.equal(calls.length, count);
});
