const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const { createResourceCache } = require('../server/lib/cache');
const {
  buildDatasetDescriptor,
  createNflverseClient,
  createNflverseProvider,
} = require('../server/lib/providers/nflverse');

const FIXTURE_DIRECTORY = path.join(__dirname, 'fixtures', 'nflverse');
const NOW = new Date('2026-09-14T03:00:00.000Z');
const LAST_MODIFIED = 'Sun, 13 Sep 2026 22:00:00 GMT';

function fixture(name) {
  return readFileSync(path.join(FIXTURE_DIRECTORY, name), 'utf8');
}

function response(body, options = {}) {
  const headers = new Map(
    Object.entries({
      etag: '"fixture-v1"',
      'last-modified': LAST_MODIFIED,
      ...(options.headers || {}),
    })
  );
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: { get: name => headers.get(name) || null },
    text: async () => body,
  };
}

function createFixtureProvider(overrides = {}) {
  const datasets = {
    players: fixture('players.csv'),
    teams: fixture('teams.csv'),
    rosters: fixture('rosters.csv'),
    schedules: fixture('schedules.csv'),
    weeklyStats: fixture('weekly-stats.csv'),
    seasonalStats: fixture('seasonal-stats.csv'),
  };
  const requests = [];
  const fetchImpl = async url => {
    requests.push(url);
    const dataset = Object.keys(datasets).find(key => {
      const descriptor = buildDatasetDescriptor(
        key,
        ['rosters', 'schedules', 'weeklyStats', 'seasonalStats'].includes(key)
          ? 2025
          : undefined,
        { now: NOW }
      );
      return descriptor.url === url;
    });
    assert.ok(dataset, `Unexpected fixture URL: ${url}`);
    return response(datasets[dataset]);
  };
  const client = createNflverseClient({
    fetchImpl,
    retries: 0,
    now: () => NOW,
    cache: createResourceCache({ now: () => NOW.getTime() }),
    ...overrides,
  });
  return {
    provider: createNflverseProvider({ client, now: () => NOW }),
    requests,
  };
}

test('documented nflverse release URLs are constructed exactly', () => {
  assert.equal(
    buildDatasetDescriptor('players', undefined, { now: NOW }).url,
    'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv'
  );
  assert.equal(
    buildDatasetDescriptor('rosters', 2025, { now: NOW }).url,
    'https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2025.csv'
  );
  assert.equal(
    buildDatasetDescriptor('schedules', 2025, { now: NOW }).url,
    'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv'
  );
  assert.equal(
    buildDatasetDescriptor('weeklyStats', 2025, { now: NOW }).url,
    'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2025.csv'
  );
  assert.equal(
    buildDatasetDescriptor('seasonalStats', 2025, { now: NOW }).url,
    'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_regpost_2025.csv'
  );
});

test('CSV parsing handles quoted commas, escaped quotes, and multiline fields', async () => {
  const client = createNflverseClient({
    fetchImpl: async () =>
      response(
        'gsis_id,display_name,first_name,last_name,status,last_season\n' +
          'player-1,"Doe, Jane",Jane,Doe,ACT,2026\n' +
          'player-2,"John ""Johnny""\nSmith",John,Smith,ACT,2026\n'
      ),
    retries: 0,
    now: () => NOW,
  });
  const provider = createNflverseProvider({ client, now: () => NOW });
  const result = await provider.getPlayers();

  assert.equal(result.data[0].displayName, 'Doe, Jane');
  assert.equal(result.data[1].displayName, 'John "Johnny"\nSmith');
});

test('unsupported datasets and seasons fail before a network request', () => {
  assert.throws(
    () => buildDatasetDescriptor('weeklyStats', 1998, { now: NOW }),
    error =>
      error.code === 'NFLVERSE_SEASON_UNSUPPORTED' && error.status === 400
  );
  assert.throws(
    () => buildDatasetDescriptor('rosters', 2027, { now: NOW }),
    error =>
      error.code === 'NFLVERSE_SEASON_UNSUPPORTED' && error.status === 400
  );
  assert.throws(
    () => buildDatasetDescriptor('unknown', undefined, { now: NOW }),
    error => error.code === 'NFLVERSE_DATASET_UNSUPPORTED'
  );
});

test('provider normalizes players, current teams, rosters, and metadata', async () => {
  const { provider } = createFixtureProvider();
  const players = await provider.getPlayers();
  const teams = await provider.getTeams();
  const rosters = await provider.getRosters(2025);

  assert.deepEqual(players.data[0], {
    playerId: '00-0033873',
    firstName: 'Patrick',
    lastName: 'Mahomes',
    displayName: 'Patrick Mahomes',
    position: 'QB',
    teamId: 'KC',
    status: 'ACT',
    active: true,
  });
  assert.deepEqual(
    teams.data.map(team => team.teamId),
    ['KC']
  );
  assert.equal(teams.meta.recordsReturned, 1);
  assert.equal(teams.meta.recordsSkipped, 1);
  assert.equal(rosters.data[0].teamId, 'KC');
  assert.equal(rosters.meta.recordsReceived, 2);
  assert.equal(rosters.meta.recordsReturned, 1);
  assert.equal(rosters.meta.recordsSkipped, 1);
  assert.equal(players.meta.provider, 'nflverse');
  assert.equal(players.meta.datasetVersion, '"fixture-v1"');
  assert.equal(players.meta.sourceUpdatedAt, '2026-09-13T22:00:00.000Z');
});

test('provider filters the shared schedule dataset by requested season', async () => {
  const { provider } = createFixtureProvider();
  const result = await provider.getSchedules(2025);

  assert.equal(result.data.length, 1);
  assert.equal(result.meta.recordsReturned, 1);
  assert.equal(result.meta.recordsSkipped, 1);
  assert.deepEqual(result.data[0], {
    gameId: '2025_01_KC_LAC',
    season: '2025',
    seasonType: 'regular',
    week: 1,
    startTime: '2025-09-05T20:20:00.000Z',
    status: 'complete',
    homeTeamId: 'LAC',
    awayTeamId: 'KC',
    homeScore: 24,
    awayScore: 27,
  });
});

test('provider normalizes weekly and seasonal numeric statistics', async () => {
  const { provider } = createFixtureProvider();
  const weekly = await provider.getWeeklyStats(2025);
  const seasonal = await provider.getSeasonalStats(2025);

  assert.equal(weekly.data[0].scope, 'week');
  assert.equal(weekly.data[0].week, 1);
  assert.equal(weekly.data[0].teamId, 'KC');
  assert.equal(weekly.data[0].gameId, '2025_01_KC_LAC');
  assert.equal(weekly.data[0].metrics.passing_yards, 291);
  assert.equal(weekly.meta.recordsSkipped, 1);
  assert.equal(seasonal.data[0].scope, 'season');
  assert.equal(seasonal.data[0].week, 0);
  assert.equal(seasonal.data[0].metrics.fantasy_points_ppr, 356.18);
});

test('client caches successful downloads without repeating network work', async () => {
  const { provider, requests } = createFixtureProvider();
  const first = await provider.getPlayers();
  const second = await provider.getPlayers();

  assert.equal(requests.length, 1);
  assert.equal(first.meta.cache.cacheStatus, 'fresh');
  assert.equal(second.meta.cache.fromCache, true);
});

test('malformed provider rows fail with a normalized safe error', async () => {
  const client = createNflverseClient({
    fetchImpl: async () => response('gsis_id,display_name\n,Missing ID\n'),
    retries: 0,
    now: () => NOW,
  });
  const provider = createNflverseProvider({ client, now: () => NOW });

  await assert.rejects(
    provider.getPlayers(),
    error =>
      error.code === 'NFLVERSE_RESPONSE_INVALID' &&
      error.status === 502 &&
      error.retryable === false
  );
});

test('HTTP failures, oversized datasets, and timeouts are normalized', async () => {
  const notFound = createNflverseClient({
    fetchImpl: async () => response('', { ok: false, status: 404 }),
    retries: 0,
    now: () => NOW,
  });
  await assert.rejects(
    notFound.getDataset('players'),
    error => error.code === 'NFLVERSE_DATASET_NOT_FOUND'
  );

  const oversized = createNflverseClient({
    fetchImpl: async () => response('12345'),
    maxResponseBytes: 4,
    retries: 0,
    now: () => NOW,
  });
  await assert.rejects(
    oversized.getDataset('players'),
    error => error.code === 'NFLVERSE_DATASET_TOO_LARGE'
  );

  const timeout = createNflverseClient({
    fetchImpl: async (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      }),
    timeoutMs: 1,
    retries: 0,
    now: () => NOW,
  });
  await assert.rejects(
    timeout.getDataset('players'),
    error =>
      error.code === 'UPSTREAM_TIMEOUT' &&
      error.status === 504 &&
      error.retryable === true
  );
});
