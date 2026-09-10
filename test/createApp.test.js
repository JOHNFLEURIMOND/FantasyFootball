const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createApp } = require('../server/createApp');
const {
  createCommandCenterService,
} = require('../server/lib/commandCenterService');

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const { port } = server.address();
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
  }
}

test('command-center API rejects invalid request parameters safely', async () => {
  let serviceCalled = false;
  const app = createApp({
    commandCenterService: {
      loadCommandCenterView: async () => {
        serviceCalled = true;
        return {};
      },
    },
  });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/command-center?week=31`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INVALID_REQUEST');
    assert.equal(body.error.message, 'The request parameters are invalid.');
    assert.equal(serviceCalled, false);
    assert.equal(JSON.stringify(body).includes('ZodError'), false);

    const blankResponse = await fetch(
      `${baseUrl}/api/command-center?week=%20%20`
    );
    const blankBody = await blankResponse.json();

    assert.equal(blankResponse.status, 400);
    assert.equal(blankBody.error.code, 'INVALID_REQUEST');
    assert.equal(serviceCalled, false);
  });
});

test('command-center API rejects malformed JSON safely', async () => {
  const app = createApp({
    commandCenterService: {
      loadCommandCenterView: async () => ({}),
    },
  });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/command-center`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{',
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INVALID_REQUEST');
    assert.equal(body.error.message, 'The request body contains invalid JSON.');
    assert.equal(JSON.stringify(body).includes('SyntaxError'), false);
  });
});

test('command-center API classifies oversized JSON as a client error', async () => {
  const app = createApp({
    commandCenterService: {
      loadCommandCenterView: async () => ({}),
    },
  });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/command-center`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: 'x'.repeat(110 * 1024) }),
    });
    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INVALID_REQUEST');
    assert.equal(
      body.error.message,
      'The request body exceeds the allowed size.'
    );
    assert.equal(JSON.stringify(body).includes('UPSTREAM_ERROR'), false);
  });
});

test('command-center API rejects invalid service output safely', async () => {
  const app = createApp({
    commandCenterService: {
      loadCommandCenterView: async () => ({ provider: 'sleeper' }),
    },
  });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/command-center`);
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'API_RESPONSE_INVALID');
    assert.equal(body.error.message, 'The API produced an invalid response.');
    assert.equal(JSON.stringify(body).includes('ZodError'), false);
  });
});

test('command-center API returns validated data and provenance', async () => {
  const commandCenterService = createCommandCenterService({
    provider: {
      getNflState: async () => ({
        week: 1,
        season_type: 'regular',
        season: '2026',
      }),
    },
    now: () => Date.parse('2026-09-10T12:00:00.000Z'),
  });
  const app = createApp({ commandCenterService });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/api/command-center`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.data.resolvedSeason, '2026');
    assert.equal(body.data.meta.schemaVersion, 1);
    assert.equal(body.data.meta.provenance[0].resource, 'nflState');
    assert.equal(
      body.data.meta.provenance[0].fetchedAt,
      '2026-09-10T12:00:00.000Z'
    );
  });
});
