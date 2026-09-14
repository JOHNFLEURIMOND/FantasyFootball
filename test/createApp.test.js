const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../server/createApp');

test('createApp initializes without errors', () => {
  assert.doesNotThrow(() => {
    createApp();
  });
});

test('createApp serves health check endpoint', async () => {
  const app = createApp();
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});
