const test = require('node:test');
const assert = require('node:assert/strict');

const { handler } = require('../netlify/functions/api');

test('Netlify API function serves health endpoint', async () => {
  const response = await handler({
    httpMethod: 'GET',
    path: '/api/health',
    queryStringParameters: {},
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    ok: true,
    service: 'fantasy-football-command-center',
  });
});

test('Netlify API function normalizes rewritten function paths', async () => {
  const response = await handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/api/health',
    queryStringParameters: {},
  });

  assert.equal(response.statusCode, 200);
});

test('Netlify API function returns JSON 404 for unknown routes', async () => {
  const response = await handler({
    httpMethod: 'GET',
    path: '/api/unknown',
    queryStringParameters: {},
  });

  assert.equal(response.statusCode, 404);
  assert.equal(JSON.parse(response.body).error.message, 'Not found');
});
