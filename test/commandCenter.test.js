const test = require('node:test');
const assert = require('node:assert/strict');

const analytics = require('../lib/analytics.cjs');
const { createResourceCache } = require('../server/lib/cache');
const { createCommandCenterService, createCriticalErrorResponse, resolveRequestedSeason, resolveRequestedWeek } = require('../server/lib/commandCenterService');
const { createSafeError, isTransientError, toSafeError } = require('../server/lib/errors');
const { withRetry } = require('../server/lib/retry');
const { createSleeperClient } = require('../server/lib/sleeperClient');

test('Sleeper client validates upstream payloads and encodes path parameters', async () => {
  let requestedUrl = null;
  const client = createSleeperClient({
    fetchImpl: async url => {
      requestedUrl = url;
      if (url.includes('/user/')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            user_id: 'user-1',
            username: 'john doe',
            display_name: 'John Doe',
            avatar: 'avatar-1',
          }),
        };
      }

      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          week: 3,
          season_type: 'regular',
          season: '2026',
        }),
      };
    },
  });

  const nflState = await client.getNflState();
  assert.equal(nflState.value.week, 3);

  await assert.rejects(
    async () => {
      const invalidClient = createSleeperClient({
        fetchImpl: async () => ({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ season: '2026' }),
        }),
      });

      await invalidClient.getNflState();
    },
    error => error.code === 'UPSTREAM_RESPONSE_INVALID'
  );

  const user = await client.getUser('john doe');
  assert.equal(user.value.username, 'john doe');
  assert.match(requestedUrl, /\/user\/john%20doe$/);
});

test('season and week resolution handles preseason week zero safely', () => {
  assert.equal(resolveRequestedSeason({ leagueSeason: '2026', season: '2025' }), '2026');
  assert.equal(resolveRequestedSeason({ leagueSeason: null, season: '2025' }), '2025');
  assert.equal(resolveRequestedWeek({ displayWeek: 0, currentWeek: 0 }), 0);
  assert.deepEqual(
    createCommandCenterService({
      provider: {
        getNflState: async () => ({ week: 0, season_type: 'pre', season: '2026', display_week: 0, league_season: '2026' }),
      },
    }).buildAvailableWeeks(0),
    []
  );
});

test('cache supports fresh hits, expiration, stale fallback, and deduplication', async () => {
  let currentTime = 0;
  const cache = createResourceCache({ now: () => currentTime });
  let loadCount = 0;

  const first = await cache.getOrLoad(
    'resource',
    async () => {
      loadCount += 1;
      return { value: 1 };
    },
    { ttlMs: 100, staleTtlMs: 200 }
  );

  const second = await cache.getOrLoad(
    'resource',
    async () => {
      loadCount += 1;
      return { value: 2 };
    },
    { ttlMs: 100, staleTtlMs: 200 }
  );

  assert.equal(loadCount, 1);
  assert.equal(first.meta.cacheStatus, 'fresh');
  assert.equal(second.meta.cacheStatus, 'fresh');

  currentTime = 150;
  const third = await cache.getOrLoad(
    'resource',
    async () => {
      loadCount += 1;
      return { value: 3 };
    },
    { ttlMs: 100, staleTtlMs: 200 }
  );

  assert.equal(loadCount, 2);
  assert.equal(third.value.value, 3);

  currentTime = 150;
  const staleCache = createResourceCache({ now: () => currentTime });
  await staleCache.getOrLoad(
    'stale-resource',
    async () => ({ value: 'fresh' }),
    { ttlMs: 50, staleTtlMs: 500 }
  );

  currentTime = 250;
  const staleResult = await staleCache.getOrLoad(
    'stale-resource',
    async () => {
      throw createSafeError({
        code: 'UPSTREAM_ERROR',
        message: 'temporary failure',
        status: 503,
        retryable: true,
      });
    },
    { ttlMs: 50, staleTtlMs: 500 }
  );

  assert.equal(staleResult.meta.cacheStatus, 'stale');
  assert.deepEqual(staleResult.value, { value: 'fresh' });

  const pendingCache = createResourceCache({ now: () => 0 });
  let pendingLoads = 0;
  const sharedPromise = new Promise(resolve => {
    setTimeout(() => resolve({ value: 'shared' }), 0);
  });

  const [dedupedA, dedupedB] = await Promise.all([
    pendingCache.getOrLoad(
      'dedupe',
      async () => {
        pendingLoads += 1;
        return sharedPromise;
      },
      { ttlMs: 100, staleTtlMs: 100 }
    ),
    pendingCache.getOrLoad(
      'dedupe',
      async () => {
        pendingLoads += 1;
        return sharedPromise;
      },
      { ttlMs: 100, staleTtlMs: 100 }
    ),
  ]);

  assert.equal(pendingLoads, 1);
  assert.deepEqual(dedupedA.value, { value: 'shared' });
  assert.deepEqual(dedupedB.value, { value: 'shared' });
});

test('retry classification only retries transient errors', async () => {
  assert.equal(isTransientError(createSafeError({ code: 'UPSTREAM_ERROR', message: 'retry', status: 503, retryable: true })), true);
  assert.equal(isTransientError(createSafeError({ code: 'VALIDATION', message: 'stop', status: 400, retryable: false })), false);

  let attempts = 0;
  const result = await withRetry(
    async attempt => {
      attempts += 1;
      if (attempt === 0) {
        throw createSafeError({ code: 'UPSTREAM_ERROR', message: 'retry', status: 503, retryable: true });
      }
      return 'ok';
    },
    { retries: 2, sleep: async () => {} }
  );

  assert.equal(result, 'ok');
  assert.equal(attempts, 2);

  let validationAttempts = 0;
  await assert.rejects(
    async () =>
      withRetry(
        async () => {
          validationAttempts += 1;
          throw createSafeError({ code: 'VALIDATION', message: 'bad request', status: 400, retryable: false });
        },
        { retries: 2, sleep: async () => {} }
      ),
    error => error.code === 'VALIDATION'
  );
  assert.equal(validationAttempts, 1);
});

test('command center service returns partial data and normalized warnings', async () => {
  const trackerEvents = [];
  const service = createCommandCenterService({
    provider: {
      getNflState: async () => ({
        value: {
        week: 0,
        season_type: 'pre',
        season: '2026',
        display_week: 0,
        league_season: '2026',
        },
        meta: { cacheStatus: 'fresh' },
      }),
      getUser: async () => ({ value: { user_id: 'user-1', username: 'alice', display_name: 'Alice', metadata: { team_name: 'A-Team' } }, meta: { cacheStatus: 'fresh' } }),
      getUserLeagues: async () => ({
        value: [{ league_id: 'l1', name: 'Alpha', status: 'in_season', sport: 'nfl', season_type: 'regular', season: '2026', total_rosters: 12, roster_positions: ['QB'], settings: {}, scoring_settings: {} }],
        meta: { cacheStatus: 'fresh' },
      }),
      getLeague: async () => ({ value: { league_id: 'l1', name: 'Alpha', status: 'in_season', sport: 'nfl', season_type: 'regular', season: '2026', total_rosters: 12, roster_positions: ['QB'], settings: {}, scoring_settings: {} }, meta: { cacheStatus: 'fresh' } }),
      getLeagueUsers: async () => ({ value: [{ user_id: 'user-1', username: 'alice', display_name: 'Alice', metadata: { team_name: 'A-Team' } }], meta: { cacheStatus: 'fresh' } }),
      getLeagueRosters: async () => {
        throw createSafeError({ code: 'UPSTREAM_ERROR', message: 'rotted', status: 503, retryable: true });
      },
      getLeagueDrafts: async () => ({ value: [{ draft_id: 'd1', type: 'snake', status: 'complete', sport: 'nfl', season_type: 'regular', season: '2026' }], meta: { cacheStatus: 'fresh' } }),
      getLeagueMatchups: async () => ({ value: [], meta: { cacheStatus: 'fresh' } }),
    },
    tracker: {
      track: (event, details) => trackerEvents.push({ event, details }),
    },
  });

  const payload = await service.loadCommandCenterView({ username: 'alice', leagueId: 'l1' });

  assert.equal(payload.user.username, 'alice');
  assert.equal(payload.leagues.length, 1);
  assert.equal(payload.selectedLeague.leagueId, 'l1');
  assert.equal(payload.rosters.length, 0);
  assert.equal(payload.drafts.length, 1);
  assert.equal(payload.warnings.length, 1);
  assert.equal(payload.warnings[0].resource, 'rosters');
  assert.equal(payload.meta.cache.rosters, undefined);
  assert.equal(trackerEvents[0].details.outcome, 'success');
});

test('safe errors remain normalized and analytics payloads omit sensitive identifiers', () => {
  const safe = toSafeError(new Error('internal stack detail'));
  assert.equal(safe.message, 'An unexpected error occurred.');
  assert.equal(safe.retryable, false);

  const critical = createCriticalErrorResponse(new Error('internal stack detail'));
  assert.equal(critical.ok, false);
  assert.equal(critical.error.message, 'An unexpected error occurred.');

  const event = analytics.buildAnalyticsEvent('username_lookup_submitted', {
    outcome: 'success',
    username: 'alice',
    leagueId: 'league-1',
    resultCount: 2,
    cacheStatus: 'fresh',
    durationMs: 240,
  });

  assert.equal(event.outcome, 'success');
  assert.equal(event.resultCount, 2);
  assert.equal(event.cacheStatus, 'fresh');
  assert.equal(event.durationBucket, 'lt250ms');
  assert.equal(event.username, undefined);
  assert.equal(event.leagueId, undefined);
});