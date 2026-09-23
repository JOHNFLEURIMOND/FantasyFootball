const test = require('node:test');
const assert = require('node:assert/strict');
require('@babel/register')({ extensions: ['.js'], presets: ['@babel/preset-env'], ignore: [/node_modules/], cache: false });
const { fetchTeams, fetchPlayerPage, fetchPlayer, fetchSchedule } = require('../components/api/nflverseApi');

test('collection loaders include later pages and preserve filters and stale state', async () => {
  const original = global.fetch;
  const urls = [];
  global.fetch = async url => {
    urls.push(url);
    const page = Number(new URL(url, 'https://test.invalid').searchParams.get('page'));
    return { ok: true, json: async () => ({ data: { data: [{ teamId: page === 1 ? 'ARI' : 'WAS' }], meta: { totalPages: 2, total: 32, stale: page === 2 } } }) };
  };
  try {
    const teams = await fetchTeams();
    assert.deepEqual(teams.data.map(item => item.teamId), ['ARI', 'WAS']);
    assert.equal(teams.meta.stale, true);
    await fetchSchedule(2026, 2);
    assert.ok(urls.some(url => url.includes('season=2026&week=2&pageSize=100&page=2')));
  } finally { global.fetch = original; }
});

test('player directory requests only the selected page and filters; profiles use ID lookup', async () => {
  const original = global.fetch;
  const urls = [];
  global.fetch = async url => {
    urls.push(url);
    return { ok: true, json: async () => url.includes('?') ? { data: { data: [], meta: { totalPages: 500 } } } : { data: { playerId: '00-123', displayName: 'Example' }, meta: { source: 'test' } } };
  };
  try {
    await fetchPlayerPage({ page: 3, q: 'A B', team: 'NE', position: 'QB' });
    assert.equal(urls.length, 1);
    assert.match(urls[0], /page=3&pageSize=50&q=A\+B&team=NE&position=QB/);
    const player = await fetchPlayer('00-123');
    assert.equal(urls[1], '/api/nflverse/players/00-123');
    assert.equal(player.data[0].displayName, 'Example');
    assert.equal(player.meta.source, 'test');
  } finally { global.fetch = original; }
});

test('season player API selects roster source and applies team filter', async () => {
  const express = require('express');
  const request = require('supertest');
  const { createNflverseRouter } = require('../server/routes/nflverseRoutes');
  const app = express();
  const calls = [];
  const player = { playerId: '00-123', firstName: 'Test', lastName: 'Player', displayName: 'Test Player', position: 'QB', teamId: 'NE', status: 'ACT', active: true };
  app.use(createNflverseRouter({ nflverseProvider: {
    getRosters: async season => { calls.push(season); return { data: [player], meta: {} }; },
    getPlayers: async () => { throw new Error('Historical source must not be used'); },
  } }));
  const response = await request(app).get('/players?season=2026&team=NE&pageSize=50');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.data[0].playerId, '00-123');
  assert.deepEqual(calls, [2026]);
  const empty = await request(app).get('/players?season=2026&team=NYJ');
  assert.equal(empty.body.data.data.length, 0);
});
